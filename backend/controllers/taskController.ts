import { Request, Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { createNotification } from '../utils/codes';

// NOTE: `tasks.progress_percentage` is added via schema_updates.sql.
// `assigned_to` (real column) is exposed to the frontend as `employee_id`.

const TASK_SELECT = `
  SELECT t.id, t.title, t.description,
         t.assigned_by, ab.first_name AS assigned_by_first, ab.last_name AS assigned_by_last,
         t.assigned_to AS employee_id, eu.first_name AS employee_first, eu.last_name AS employee_last,
         t.deadline AS due_date, t.priority, t.status, t.progress_percentage, t.created_at
  FROM tasks t
  LEFT JOIN employees abe ON abe.id = t.assigned_by
  LEFT JOIN users ab ON ab.id = abe.user_id
  LEFT JOIN employees ate ON ate.id = t.assigned_to
  LEFT JOIN users eu ON eu.id = ate.user_id
`;

function shape(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assigned_by: row.assigned_by,
    assigned_by_name: row.assigned_by_first ? `${row.assigned_by_first} ${row.assigned_by_last}` : 'Management',
    employee_id: row.employee_id,
    employee_name: row.employee_first ? `${row.employee_first} ${row.employee_last}` : '',
    due_date: row.due_date,
    priority: row.priority,
    status: row.status,
    progress_percentage: row.progress_percentage,
    created_at: row.created_at,
  };
}

export const getTasks = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let sql = TASK_SELECT;
    const params: any[] = [];

    if (user?.role === 'Employee') {
      const [emp] = await query('SELECT id FROM employees WHERE user_id = ?', [user.id]);
      sql += ' WHERE t.assigned_to = ?';
      params.push(emp?.id ?? -1);
    } else if (user?.role === 'Manager') {
      const [mgrEmp] = await query('SELECT id, department_id FROM employees WHERE user_id = ?', [user.id]);
      if (mgrEmp?.department_id) {
        sql += ` WHERE t.assigned_to IN (SELECT id FROM employees WHERE department_id = ?) OR t.assigned_by = ?`;
        params.push(mgrEmp.department_id, mgrEmp.id);
      }
    }
    sql += ' ORDER BY t.created_at DESC';

    const rows = await query(sql, params);
    res.json({ success: true, data: rows.map(shape) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, description, employeeId, dueDate, priority } = req.body;

    const [assignerEmp] = await query('SELECT id FROM employees WHERE user_id = ?', [user?.id]);
    const [targetEmp] = await query('SELECT id, user_id FROM employees WHERE id = ?', [Number(employeeId)]);

    if (!targetEmp) {
      return res.status(400).json({ success: false, message: 'Assigned employee not found' });
    }

    const result = await execute(
      `INSERT INTO tasks (title, description, assigned_to, assigned_by, priority, status, progress_percentage, deadline)
       VALUES (?, ?, ?, ?, ?, 'Pending', 0, ?)`,
      [title, description || '', targetEmp.id, assignerEmp?.id ?? null, priority || 'Medium', dueDate || null]
    );

    const [row] = await query(TASK_SELECT + ' WHERE t.id = ?', [result.insertId]);

    if (targetEmp.user_id) {
      await createNotification(
        execute,
        targetEmp.user_id,
        'New Task Assigned 📌',
        `You were assigned task '${title}' due on ${dueDate}.`,
        'Task Assigned',
        'TASK',
        result.insertId
      );
    }

    res.json({ success: true, data: shape(row), message: 'Task assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progressPercentage } = req.body;

    const [existing] = await query('SELECT * FROM tasks WHERE id = ?', [Number(id)]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    let newStatus = existing.status;
    let newProgress = existing.progress_percentage;

    if (progressPercentage !== undefined) {
      newProgress = Number(progressPercentage);
      newStatus = newProgress >= 100 ? 'Completed' : newProgress > 0 ? 'In Progress' : newStatus;
    }
    if (status) {
      newStatus = status;
      if (status === 'Completed') newProgress = 100;
    }

    await execute(
      `UPDATE tasks SET status = ?, progress_percentage = ?, completed_at = ${newStatus === 'Completed' ? 'NOW()' : 'completed_at'} WHERE id = ?`,
      [newStatus, newProgress, Number(id)]
    );

    const [row] = await query(TASK_SELECT + ' WHERE t.id = ?', [Number(id)]);
    res.json({ success: true, data: shape(row), message: 'Task updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
