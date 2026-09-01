import { query, execute } from '../config/mysqlDb';

export interface AuditLogPayload {
  actor_user_id?: number | null;
  actor_email?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'ASSIGN' | 'COMPLETE' | 'SUBMIT' | string;
  entity_type: 'USER' | 'EMPLOYEE' | 'DEPARTMENT' | 'SKILL' | 'ASSESSMENT' | 'TRAINING' | 'LEAVE' | 'PROFILE' | 'SYSTEM' | string;
  entity_id: string | number;
  old_values?: any;
  new_values?: any;
  description?: string;
  ip_address?: string;
  user_agent?: string;
}

// Function to safely sanitize sensitive objects (passwords, hashes, tokens)
const sanitizeData = (data: any): any => {
  if (!data) return null;
  if (typeof data !== 'object') return data;

  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  const sensitiveKeys = ['password', 'password_hash', 'token', 'jwt', 'secret', 'authorization'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  return sanitized;
};

let auditCounter = 100;

export const logAudit = async (payload: AuditLogPayload): Promise<string | null> => {
  try {
    const safeOld = payload.old_values ? JSON.stringify(sanitizeData(payload.old_values)) : null;
    const safeNew = payload.new_values ? JSON.stringify(sanitizeData(payload.new_values)) : null;
    const actorId = payload.actor_user_id || null;
    const entityIdStr = String(payload.entity_id || 'N/A');
    const ip = payload.ip_address || '127.0.0.1';
    const ua = payload.user_agent || 'OKGIP-System/1.0';

    // Generate unique public Audit ID: AUD-000001
    const countRes = await query<{ maxId: number }>('SELECT MAX(id) as maxId FROM audit_logs');
    const count = (countRes[0]?.maxId || 0) + 1;
    const auditCode = `AUD-${String(count).padStart(6, '0')}`;

    // MySQL Insert
    await execute(`
      INSERT INTO audit_logs (
        audit_code, actor_user_id, action, entity_type, entity_id,
        old_values, new_values, description, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      auditCode,
      actorId,
      payload.action.toUpperCase(),
      payload.entity_type.toUpperCase(),
      entityIdStr,
      safeOld,
      safeNew,
      payload.description || `${payload.action} operation on ${payload.entity_type} ${entityIdStr}`,
      ip,
      ua
    ]);


    return auditCode;
  } catch (error: any) {
    console.error('Audit logging error:', error.message);
    return null;
  }
};
