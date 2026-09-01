import { Request, Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { createNotification } from '../utils/codes';

// NOTE: `subject` is added to `messages` via schema_updates.sql (not present
// in the original dump). `receiver_id` in API responses maps to the real
// `recipient_id` column.

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const messages = await query(
      `SELECT id, sender_id, recipient_id AS receiver_id, subject, content, is_read, created_at
       FROM messages
       WHERE sender_id = ? OR recipient_id = ?
       ORDER BY created_at DESC`,
      [userId, userId]
    );

    const [{ unreadCount }] = await query(
      'SELECT COUNT(*) AS unreadCount FROM messages WHERE recipient_id = ? AND is_read = 0',
      [userId]
    );

    res.json({ success: true, data: messages, unreadCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user?.id;
    const { receiverId, subject, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }

    const [senderUser] = await query(
      `SELECT COALESCE(NULLIF(TRIM(CONCAT(first_name,' ',last_name)),''), email) AS name FROM users WHERE id = ?`,
      [senderId]
    );
    const senderName = senderUser?.name || 'User';

    const result = await execute(
      `INSERT INTO messages (sender_id, recipient_id, is_announcement, subject, content, is_read)
       VALUES (?, ?, 0, ?, ?, 0)`,
      [senderId, Number(receiverId), subject || null, content]
    );

    const [newMessage] = await query(
      `SELECT id, sender_id, recipient_id AS receiver_id, subject, content, is_read, created_at FROM messages WHERE id = ?`,
      [result.insertId]
    );

    await createNotification(
      execute,
      Number(receiverId),
      'New Message Received',
      `${senderName} sent you a message: "${(subject || content).substring(0, 30)}..."`,
      'Manager Message',
      'MESSAGE',
      result.insertId
    );

    res.json({ success: true, data: newMessage, message: 'Message sent successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markMessageRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await execute('UPDATE messages SET is_read = 1 WHERE id = ?', [Number(id)]);
    res.json({ success: true, message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
