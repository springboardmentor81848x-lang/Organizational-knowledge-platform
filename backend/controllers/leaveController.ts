import { Request, Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { createNotification, nextCode } from '../utils/codes';

// NOTE: leave_requests.approver_role / approver_comments / approved_by /
// approved_at / rejected_at are added via schema_updates.sql. `current_approver_id`
// (real column) is exposed to the frontend as `approver_id`; `duration_days` as
// `number_of_days`, to match the original API shape.

async function getUserRole(userId: number): Promise<string> {
  const [row] = await query(
    `SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ? LIMIT 1`,
    [userId]
  );
  return row?.name || 'Employee';
}

async function findUserWithRole(roleName: string, excludeUserId: number, departmentId?: number) {
  let sql = `
    SELECT u.id, u.email FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    LEFT JOIN employees e ON e.user_id = u.id
    WHERE r.name = ? AND u.id != ?
  `;
  const params: any[] = [roleName, excludeUserId];
  if (departmentId) {
    sql += ' AND e.department_id = ?';
    params.push(departmentId);
  }
  sql += ' LIMIT 1';
  const [row] = await query(sql, params);
  return row || null;
}

async function formatApprover(userId: number, fallbackRole?: string) {
  const [u] = await query('SELECT id, email FROM users WHERE id = ?', [userId]);
  const [approverEmp] = await query(
    `SELECT e.*, d.name AS department_name FROM employees e LEFT JOIN departments d ON d.id = e.department_id WHERE e.user_id = ?`,
    [userId]
  );
  const role = fallbackRole || (await getUserRole(userId));
  return {
    userId: u.id,
    employeeId: approverEmp?.id || null,
    name: approverEmp ? `${approverEmp.first_name ?? ''} ${approverEmp.last_name ?? ''}`.trim() || u.email : u.email,
    email: u.email,
    role,
    designation: approverEmp?.designation || role,
    departmentName: approverEmp?.department_name || 'Organization Workforce',
  };
}

/** Hierarchy: Employee -> Team Lead (Manager) -> Department Head -> HR Specialist -> Sys Admin */
export async function getApproverForUser(userId: number) {
  const [user] = await query('SELECT id, email FROM users WHERE id = ?', [userId]);
  if (!user) return null;

  const [emp] = await query('SELECT * FROM employees WHERE user_id = ?', [userId]);
  const deptId = emp?.department_id;
  const [dept] = deptId ? await query('SELECT * FROM departments WHERE id = ?', [deptId]) : [null];
  const role = await getUserRole(userId);

  if (role === 'Employee') {
    if (deptId) {
      let teamLead = await findUserWithRole('Manager', userId, deptId);
      if (!teamLead) teamLead = await findUserWithRole('Team Lead', userId, deptId);
      if (teamLead) return formatApprover(teamLead.id, 'Team Lead');
    }
    if (dept?.department_head_id) {
      const [headEmp] = await query('SELECT * FROM employees WHERE id = ?', [dept.department_head_id]);
      if (headEmp && headEmp.user_id !== userId) {
        return formatApprover(headEmp.user_id, 'Department Head');
      }
    }
    const deptHead = await findUserWithRole('Department Head', userId);
    if (deptHead) return formatApprover(deptHead.id, 'Department Head');
    const hr = await findUserWithRole('HR Specialist', userId);
    if (hr) return formatApprover(hr.id, 'HR Specialist');
  }

  if (role === 'Manager' || role === 'Team Lead') {
    if (dept?.department_head_id) {
      const [headEmp] = await query('SELECT * FROM employees WHERE id = ?', [dept.department_head_id]);
      if (headEmp && headEmp.user_id !== userId) {
        return formatApprover(headEmp.user_id, 'Department Head');
      }
    }
    const deptHead = await findUserWithRole('Department Head', userId);
    if (deptHead) return formatApprover(deptHead.id, 'Department Head');
    const hr = await findUserWithRole('HR Specialist', userId);
    if (hr) return formatApprover(hr.id, 'HR Specialist');
  }

  if (role === 'Department Head') {
    const hr = await findUserWithRole('HR Specialist', userId);
    if (hr) return formatApprover(hr.id, 'HR Specialist');
    const admin = await findUserWithRole('Admin', userId);
    if (admin) return formatApprover(admin.id, 'Sys Admin');
  }

  const adminOrHr = (await findUserWithRole('Admin', userId)) || (await findUserWithRole('HR Specialist', userId));
  if (adminOrHr) return formatApprover(adminOrHr.id);

  return null;
}

export const getApproverInfo = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const approver = await getApproverForUser(user.id);
    if (!approver) {
      return res.status(200).json({ success: false, approver: null, message: 'We could not determine your leave approver. Please contact HR.' });
    }
    return res.json({ success: true, approver });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const LEAVE_SELECT = `
  SELECT l.*, l.current_approver_id AS approver_id, l.duration_days AS number_of_days,
         CONCAT(u.first_name,' ',u.last_name) AS employee_name, COALESCE(d.name,'General') AS department_name
  FROM leave_requests l
  JOIN employees e ON e.id = l.employee_id
  JOIN users u ON u.id = e.user_id
  LEFT JOIN departments d ON d.id = e.department_id
`;

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const view = req.query.view as string;
    const [emp] = await query('SELECT id FROM employees WHERE user_id = ?', [user.id]);
    const role = await getUserRole(user.id);

    let sql = LEAVE_SELECT;
    const params: any[] = [];

    if (view === 'my') {
      sql += ' WHERE l.employee_id = ?';
      params.push(emp?.id ?? -1);
    } else if (view === 'assigned') {
      sql += ' WHERE l.current_approver_id = ?';
      params.push(user.id);
    } else if (role === 'Employee' || role === 'L&D Admin / Mentor') {
      sql += ' WHERE l.employee_id = ?';
      params.push(emp?.id ?? -1);
    } else if (role === 'Manager' || role === 'Team Lead' || role === 'Department Head') {
      sql += ' WHERE l.current_approver_id = ? OR l.employee_id = ?';
      params.push(user.id, emp?.id ?? -1);
    }
    // HR Specialist / Admin: no filter — see everything

    const list = await query(sql, params);
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const role = await getUserRole(user.id);

    let sql = LEAVE_SELECT + ` WHERE l.status = 'Pending' AND `;
    if (role === 'HR Specialist' || role === 'Admin') {
      sql += `(l.current_approver_id = ? OR l.approver_role = 'HR Specialist' OR ? = 'Admin')`;
    } else {
      sql += `l.current_approver_id = ?`;
    }
    const params = role === 'HR Specialist' || role === 'Admin' ? [user.id, role] : [user.id];

    const pendingList = await query(sql, params);
    res.json({ success: true, data: pendingList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyLeave = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'Start date and End date are required.' });
    if (!leaveType) return res.status(400).json({ success: false, message: 'Leave type is required.' });
    if (!reason || !reason.trim()) return res.status(400).json({ success: false, message: 'Reason for leave is required.' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date format.' });
    }
    if (end < start) return res.status(400).json({ success: false, message: 'End date cannot be before start date.' });

    const numberOfDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let [emp] = await query('SELECT * FROM employees WHERE user_id = ?', [user.id]);
    if (!emp) {
      const empName = user.email.split('@')[0];
      const employeeCode = await nextCode('employees', 'EMP');
      await execute(
        `INSERT INTO employees (employee_code, user_id, department_id, designation, joining_date, employment_status, phone, avatar_url)
         VALUES (?, ?, 1, ?, CURDATE(), 'ACTIVE', '+1-800-555-0199', '/default-avatar.svg')`,
        [employeeCode, user.id, user.role === 'Admin' ? 'System Administrator' : user.role]
      );
      [emp] = await query('SELECT * FROM employees WHERE user_id = ?', [user.id]);
    }

    const approver = await getApproverForUser(user.id);
    if (!approver) {
      return res.status(400).json({ success: false, message: 'We could not determine your leave approver. Please contact HR.' });
    }

    const leaveCode = await nextCode('leave_requests', 'LV');
    const result = await execute(
      `INSERT INTO leave_requests (leave_code, employee_id, leave_type, start_date, end_date, duration_days, reason, current_approver_id, approver_role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [leaveCode, emp.id, leaveType, startDate, endDate, numberOfDays, reason.trim(), approver.userId, approver.role]
    );

    await createNotification(
      execute, approver.userId, 'New Leave Request Assigned',
      `${approver.name ? '' : ''}A ${leaveType} leave request for ${startDate} to ${endDate} (${numberOfDays} days) needs your review.`,
      'System', 'LEAVE_REQUEST', result.insertId
    );

    const [newLeave] = await query(LEAVE_SELECT + ' WHERE l.id = ?', [result.insertId]);

    res.json({ success: true, data: newLeave, message: `Leave request submitted successfully and assigned to ${approver.name} (${approver.role}).` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function decideLeave(req: Request, res: Response, decision: 'Approved' | 'Rejected') {
  const { id } = req.params;
  const { comments } = req.body;
  const user = (req as any).user;

  const [leave] = await query('SELECT * FROM leave_requests WHERE id = ?', [Number(id)]);
  if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

  const [emp] = await query('SELECT * FROM employees WHERE user_id = ?', [user.id]);
  if (emp && leave.employee_id === emp.id) {
    return res.status(403).json({ success: false, message: `Security Error: You cannot ${decision === 'Approved' ? 'approve' : 'reject'} your own leave request.` });
  }

  const isAssignedApprover = leave.current_approver_id === user.id;
  const isHrOrAdmin = user.role === 'HR Specialist' || user.role === 'Admin';
  if (!isAssignedApprover && !isHrOrAdmin) {
    return res.status(403).json({ success: false, message: `Unauthorized: You are not assigned to ${decision === 'Approved' ? 'approve' : 'reject'} this leave request.` });
  }

  const approverName = emp ? `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() : user.email;
  const defaultComment = decision === 'Approved' ? 'Approved by management.' : 'Leave request rejected.';

  if (decision === 'Approved') {
    await execute(
      `UPDATE leave_requests SET status = 'Approved', approved_by = ?, approver_comments = ?, approved_at = NOW() WHERE id = ?`,
      [approverName, comments || defaultComment, Number(id)]
    );
  } else {
    await execute(
      `UPDATE leave_requests SET status = 'Rejected', approved_by = ?, approver_comments = ?, rejected_at = NOW() WHERE id = ?`,
      [approverName, comments || defaultComment, Number(id)]
    );
  }

  const [targetEmp] = await query('SELECT * FROM employees WHERE id = ?', [leave.employee_id]);
  if (targetEmp) {
    if (decision === 'Approved') {
      await execute(`UPDATE employees SET employment_status = 'ON_LEAVE' WHERE id = ?`, [targetEmp.id]);
      await createNotification(
        execute, targetEmp.user_id, 'Leave Request Approved',
        `Your ${leave.leave_type} leave request (${leave.start_date} to ${leave.end_date}) was approved by ${approverName}.`,
        'Leave Approved', 'LEAVE_REQUEST', leave.id
      );
    } else {
      await createNotification(
        execute, targetEmp.user_id, 'Leave Request Rejected',
        `Your ${leave.leave_type} leave request (${leave.start_date} to ${leave.end_date}) was rejected by ${approverName}. Reason: ${comments || 'Not approved'}`,
        'System', 'LEAVE_REQUEST', leave.id
      );
    }
  }

  const [updated] = await query(LEAVE_SELECT + ' WHERE l.id = ?', [Number(id)]);
  return res.json({ success: true, data: updated, message: `Leave request ${decision.toLowerCase()} by ${approverName}.` });
}

export const approveLeave = (req: Request, res: Response) => decideLeave(req, res, 'Approved');
export const rejectLeave = (req: Request, res: Response) => decideLeave(req, res, 'Rejected');

export const updateLeaveStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  if (status === 'Approved') return approveLeave(req, res);
  if (status === 'Rejected') return rejectLeave(req, res);
  return res.status(400).json({ success: false, message: 'Invalid status' });
};

export const cancelLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const [emp] = await query('SELECT id FROM employees WHERE user_id = ?', [user.id]);

    const [leave] = await query('SELECT * FROM leave_requests WHERE id = ?', [Number(id)]);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

    if (emp && leave.employee_id !== emp.id && user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only cancel your own pending leave request.' });
    }
    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending leave requests can be cancelled.' });
    }

    await execute('DELETE FROM leave_requests WHERE id = ?', [Number(id)]);
    res.json({ success: true, message: 'Leave request cancelled successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
