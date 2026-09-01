import { Request, Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { nextCode, createNotification } from '../utils/codes';

export const getBadges = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.query;
    let sql = 'SELECT id, employee_id, badge_title AS badge_type, description, icon, awarded_at FROM employee_badges';
    const params: any[] = [];
    if (employeeId) {
      sql += ' WHERE employee_id = ?';
      params.push(Number(employeeId));
    }
    sql += ' ORDER BY awarded_at DESC';
    const rows = await query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const awardBadge = async (req: Request, res: Response) => {
  try {
    const { employeeId, badgeType, description, icon } = req.body;
    const empId = Number(employeeId);

    const result = await execute(
      `INSERT INTO employee_badges (employee_id, badge_title, description, icon, awarded_at)
       VALUES (?, ?, ?, ?, CURDATE())`,
      [empId, badgeType, description || `Awarded ${badgeType} badge`, icon || 'Award']
    );

    const [newBadge] = await query(
      'SELECT id, employee_id, badge_title AS badge_type, description, icon, awarded_at FROM employee_badges WHERE id = ?',
      [result.insertId]
    );

    const [emp] = await query('SELECT user_id FROM employees WHERE id = ?', [empId]);
    if (emp?.user_id) {
      await createNotification(
        execute,
        emp.user_id,
        'New Badge Earned! 🏆',
        `Congratulations! You have been awarded the '${badgeType}' badge.`,
        'Skill Verified',
        'BADGE',
        result.insertId
      );
    }

    res.json({ success: true, data: newBadge, message: 'Badge awarded successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
