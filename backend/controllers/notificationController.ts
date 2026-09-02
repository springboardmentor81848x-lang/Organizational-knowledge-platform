import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { nextCode } from '../utils/codes';

const MANAGEMENT_ROLES = ['Admin', 'Manager', 'Department Head', 'HR Specialist', 'L&D Admin', 'L&D Admin / Mentor'];

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let sql = `SELECT id, recipient_user_id AS user_id, notification_type AS type, title, message,
               related_entity_type, related_entity_id, priority, link, is_read, created_at
               FROM notifications`;
    const params: any[] = [];

    if (!MANAGEMENT_ROLES.includes(req.user.role)) {
      sql += ' WHERE recipient_user_id = ?';
      params.push(req.user.id);
    }
    sql += ' ORDER BY created_at DESC';

    const list = await query(sql, params);
    const unreadCount = list.filter((n: any) => !n.is_read).length;

    return res.json({ success: true, unread_count: unreadCount, data: list });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      if (req.user) {
        if (MANAGEMENT_ROLES.includes(req.user.role)) {
          await execute('UPDATE notifications SET is_read = 1');
        } else {
          await execute('UPDATE notifications SET is_read = 1 WHERE recipient_user_id = ?', [req.user.id]);
        }
      }
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    await execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [Number(id)]);
    const [notif] = await query(
      `SELECT id, recipient_user_id AS user_id, notification_type AS type, title, message, is_read, created_at
       FROM notifications WHERE id = ?`,
      [Number(id)]
    );
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.json({ success: true, message: 'Notification marked as read', data: notif });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

// POST /api/notifications/dispatch (Simulate instant dispatch via Email/SMS/Push)
export const dispatchNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, title, message, type, priority, channels, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const targetUserId = Number(userId) || req.user?.id;
    const [emp] = await query(
      `SELECT e.phone, u.email FROM employees e JOIN users u ON u.id = e.user_id WHERE e.user_id = ?`,
      [targetUserId]
    );
    const now = new Date().toISOString();
    const recipientEmail = emp?.email || req.user?.email || 'alex.morgan@okgip.org';
    const recipientPhone = emp?.phone || '+1-555-019-8234';

    const code = await nextCode('notifications', 'NOTIF');
    const result = await execute(
      `INSERT INTO notifications (notification_code, recipient_user_id, notification_type, title, message, priority, link, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [code, targetUserId, type || 'Gap Alert', title, message, priority || 'High', link || '/notifications']
    );

    const newNotif = {
      id: result.insertId,
      user_id: targetUserId,
      title,
      message,
      type: type || 'Gap Alert',
      priority: priority || 'High',
      channels: {
        in_app: true,
        email: channels?.email !== false ? { sent: true, sent_at: now, recipient_email: recipientEmail } : undefined,
        sms: channels?.sms === true ? { sent: true, sent_at: now, recipient_phone: recipientPhone } : undefined,
        push: channels?.push !== false ? { sent: true, sent_at: now, device_token: `FCM-TOK-${targetUserId}-${Math.floor(1000 + Math.random() * 9000)}` } : undefined,
      },
      link: link || '/notifications',
      is_read: false,
      created_at: now,
    };

    return res.status(201).json({
      success: true,
      message: 'Notification dispatched successfully across active channels (In-App, Email, SMS, Push FCM).',
      data: newNotif,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
