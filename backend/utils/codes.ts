import { query } from '../config/mysqlDb';

/** Generates the next sequential code for a table, e.g. nextCode('employees','EMP') -> 'EMP-000017'. */
export async function nextCode(table: string, prefix: string, pad = 6): Promise<string> {
  const rows = await query<{ maxId: number }>(`SELECT MAX(id) as maxId FROM ${table}`);
  const nextId = (rows[0]?.maxId || 0) + 1;
  return `${prefix}-${String(nextId).padStart(pad, '0')}`;
}

/** Creates a notification row using the real `notifications` schema. */
export async function createNotification(
  execute: (sql: string, params?: any[]) => Promise<any>,
  recipientUserId: number,
  title: string,
  message: string,
  notificationType: string = 'General',
  relatedEntityType?: string,
  relatedEntityId?: string | number
) {
  const code = await nextCode('notifications', 'NOTIF');
  await execute(
    `INSERT INTO notifications (notification_code, recipient_user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [code, recipientUserId, notificationType, title, message, relatedEntityType ?? null, relatedEntityId != null ? String(relatedEntityId) : null]
  );
}

// Audit logging lives in ../services/auditLogger.ts (logAudit) — use that
// directly for anything writing to audit_logs, so there's one implementation.
