import { Request, Response } from 'express';
import { query } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'Admin' && user?.role !== 'Sys Admin' && user?.role !== 'HR Specialist') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required for Audit Logs' });
    }

    const { actor, action, entity, entityId, startDate, endDate, search, limit = 100 } = req.query;

    let sql = `
      SELECT al.*, u.email as actor_email, CONCAT(e.first_name, ' ', e.last_name) as actor_name
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_user_id = u.id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (actor) {
      sql += ' AND (al.actor_user_id = ? OR u.email LIKE ? OR e.first_name LIKE ?)';
      params.push(actor, `%${actor}%`, `%${actor}%`);
    }

    if (action) {
      sql += ' AND al.action = ?';
      params.push(String(action).toUpperCase());
    }

    if (entity) {
      sql += ' AND al.entity_type = ?';
      params.push(String(entity).toUpperCase());
    }

    if (entityId) {
      sql += ' AND al.entity_id = ?';
      params.push(String(entityId));
    }

    if (startDate) {
      sql += ' AND al.created_at >= ?';
      params.push(String(startDate));
    }

    if (endDate) {
      sql += ' AND al.created_at <= ?';
      params.push(String(endDate));
    }

    if (search) {
      sql += ' AND (al.audit_code LIKE ? OR al.description LIKE ? OR al.entity_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(Number(limit));

    const logs = await query(sql, params);

    // Parse JSON strings in old_values & new_values if string
    const sanitizedLogs = logs.map((log: any) => {
      let parsedOld = log.old_values;
      let parsedNew = log.new_values;

      if (typeof log.old_values === 'string') {
        try { parsedOld = JSON.parse(log.old_values); } catch (e) { parsedOld = log.old_values; }
      }
      if (typeof log.new_values === 'string') {
        try { parsedNew = JSON.parse(log.new_values); } catch (e) { parsedNew = log.new_values; }
      }

      return {
        ...log,
        old_values: parsedOld,
        new_values: parsedNew,
      };
    });

    res.json({
      success: true,
      count: sanitizedLogs.length,
      data: sanitizedLogs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
