import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { nextCode } from '../utils/codes';

async function getRoleId(roleName: string): Promise<number> {
  const rows = await query<{ id: number }>('SELECT id FROM roles WHERE name = ?', [roleName]);
  if (rows[0]) return rows[0].id;
  const fallback = await query<{ id: number }>("SELECT id FROM roles WHERE name = 'Employee'");
  return fallback[0]?.id || 6;
}

// Every DB-backed role a user can actually be assigned via User Management.
// Previously this was a partial list (['Admin','Manager','Employee']),
// which meant selecting HR Specialist, Department Head, or L&D Admin /
// Mentor (Learning & Development) from the dropdown silently did nothing —
// the role update was dropped and the target user kept whatever role they
// had before. That's the concrete bug behind "Admin and Learning &
// Development are joined": reassigning someone to L&D via this screen
// never actually applied, so they'd appear stuck on their prior role.
// "System Administrator" is a display-only label for the same 'Admin' row
// (see UserManagement.tsx's dropdown — its <option value="Admin">) and is
// intentionally not a separate entry here.
const ASSIGNABLE_ROLES = ['Admin', 'Manager', 'HR Specialist', 'Department Head', 'L&D Admin / Mentor', 'Employee'];

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.status AS user_status, u.created_at, u.updated_at,
             r.name AS role,
             e.id AS employee_id, e.designation, e.department_id, e.phone, e.avatar_url AS photo_url, e.employment_status AS status
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      LEFT JOIN employees e ON u.id = e.user_id
      ORDER BY u.id ASC
    `);

    const users = rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      role: r.role || 'Employee',
      created_at: r.created_at,
      employee: r.employee_id
        ? {
            id: r.employee_id,
            first_name: r.first_name,
            last_name: r.last_name,
            designation: r.designation,
            department_id: r.department_id,
            phone: r.phone,
            photo_url: r.photo_url,
            status: r.status,
          }
        : null,
    }));

    return res.json({ success: true, count: users.length, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, designation, departmentId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Email, password, first name and last name are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userRole = ASSIGNABLE_ROLES.includes(role) ? role : 'Employee';
    const userCode = await nextCode('users', 'USER');

    const userResult = await execute(
      `INSERT INTO users (user_code, email, password_hash, first_name, last_name, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [userCode, cleanEmail, passwordHash, firstName, lastName]
    );
    const newUserId = userResult.insertId;

    const roleId = await getRoleId(userRole);
    await execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [newUserId, roleId]);

    const empDeptId = departmentId ? Number(departmentId) : null;
    const empDesignation = designation || (userRole === 'Admin' ? 'Administrator' : userRole === 'Manager' ? 'Manager' : 'Specialist');
    const employeeCode = await nextCode('employees', 'EMP');

    await execute(
      `INSERT INTO employees (employee_code, user_id, department_id, designation, joining_date, employment_status, phone, avatar_url)
       VALUES (?, ?, ?, ?, CURDATE(), 'ACTIVE', ?, '/default-avatar.svg')`,
      [employeeCode, newUserId, empDeptId, empDesignation, '+1-800-555-0199']
    );

    const [newUser] = await query('SELECT * FROM users WHERE id = ?', [newUserId]);
    const [newEmployee] = await query('SELECT * FROM employees WHERE user_id = ?', [newUserId]);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { ...newUser, role: userRole, employee: newEmployee },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create user' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, email, password, firstName, lastName, designation, departmentId, status } = req.body;
    const userId = Number(id);

    if (role && ASSIGNABLE_ROLES.includes(role)) {
      const roleId = await getRoleId(role);
      await execute(
        `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`,
        [userId, roleId]
      );
      // Remove any other roles this user had, so they have exactly one primary role
      await execute('DELETE FROM user_roles WHERE user_id = ? AND role_id != ?', [userId, roleId]);
    }

    if (password && password.trim().length > 0) {
      const hash = bcrypt.hashSync(password, 10);
      await execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
    }

    if (firstName || lastName || email) {
      await execute(
        `UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), email = COALESCE(?, email) WHERE id = ?`,
        [firstName || null, lastName || null, email ? String(email).toLowerCase().trim() : null, userId]
      );
    }

    if (designation || departmentId !== undefined || status) {
      await execute(
        `UPDATE employees SET
          designation = COALESCE(?, designation),
          department_id = COALESCE(?, department_id),
          employment_status = COALESCE(?, employment_status)
         WHERE user_id = ?`,
        [designation || null, departmentId !== undefined ? Number(departmentId) : null, status || null, userId]
      );
    }

    return res.json({ success: true, message: 'User account updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (req.user?.id === userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator account' });
    }

    // employees, user_roles rows cascade via FK ON DELETE CASCADE
    await execute('DELETE FROM users WHERE id = ?', [userId]);

    return res.json({ success: true, message: 'User and employee records deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete user' });
  }
};
