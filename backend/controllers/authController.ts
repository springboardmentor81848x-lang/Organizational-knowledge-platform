import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest, JWT_SECRET } from '../middleware/auth';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Looks up a user's primary role name via user_roles -> roles. Defaults to 'Employee'. */
async function getUserRole(userId: number): Promise<string> {
  const rows = await query<{ name: string }>(
    `SELECT r.name FROM user_roles ur
     JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = ? ORDER BY ur.id ASC LIMIT 1`,
    [userId]
  );
  return rows[0]?.name || 'Employee';
}

async function getRoleId(roleName: string): Promise<number> {
  const rows = await query<{ id: number }>('SELECT id FROM roles WHERE name = ?', [roleName]);
  if (rows[0]) return rows[0].id;
  const fallback = await query<{ id: number }>("SELECT id FROM roles WHERE name = 'Employee'");
  return fallback[0]?.id || 6;
}

/** Fetches the full employee row (joined with department name) for a user, or null. */
async function getEmployeeForUser(userId: number) {
  const rows = await query(
    `SELECT e.*, d.name AS department_name
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE e.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function nextCode(table: string, column: string, prefix: string, pad = 6): Promise<string> {
  const rows = await query<{ maxId: number }>(`SELECT MAX(id) as maxId FROM ${table}`);
  const nextId = (rows[0]?.maxId || 0) + 1;
  return `${prefix}-${String(nextId).padStart(pad, '0')}`;
}

function publicUser(userRow: any, role: string, employee: any) {
  return {
    id: userRow.id,
    userCode: userRow.user_code,
    email: userRow.email,
    firstName: userRow.first_name,
    lastName: userRow.last_name,
    phone: userRow.phone_number,
    profilePhoto: userRow.profile_photo,
    status: userRow.status,
    role,
    employee,
  };
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const users = await query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    const user = users[0];

    // Temporary diagnostic logging — remove once the login issue is
    // confirmed fixed. This tells us, from the actual running server,
    // exactly which DB it queried and what it found — which is the one
    // thing a MySQL Workbench check against the DB directly can't show us.
    console.log('[login] DB target:', { host: process.env.DB_HOST, name: process.env.DB_NAME });
    console.log('[login] searched email:', cleanEmail, '-> found user:', !!user, user ? { id: user.id, status: user.status, hash_len: user.password_hash?.length } : null);

    if (!user) {
      console.error(`[login] No user row found for email "${cleanEmail}" on DB_HOST=${process.env.DB_HOST} DB_NAME=${process.env.DB_NAME} — if this DB has the row (verified via Workbench), the server is pointed at a different database.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'This account is not active' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    console.log('[login] bcrypt.compareSync result:', isMatch, '(password length received:', password.length, ')');
    if (!isMatch) {
      console.error(`[login] User row found but password did not match for "${cleanEmail}". This means the DB connection is correct — the issue is either the password sent, or the stored hash for this specific row.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const role = await getUserRole(user.id);
    const employee = await getEmployeeForUser(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role, employeeId: employee?.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser(user, role, employee),
    });
  } catch (error: any) {
    console.error('login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, designation, departmentId, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userCode = await nextCode('users', 'user_code', 'USER');

    const userResult = await execute(
      `INSERT INTO users (user_code, email, password_hash, first_name, last_name, phone_number, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [userCode, cleanEmail, passwordHash, firstName, lastName, phone || null]
    );
    const newUserId = userResult.insertId;

    const roleName = role || 'Employee';
    const roleId = await getRoleId(roleName);
    await execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [newUserId, roleId]);

    const employeeCode = await nextCode('employees', 'employee_code', 'EMP');
    await execute(
      `INSERT INTO employees (employee_code, user_id, department_id, designation, joining_date, employment_status, phone, avatar_url)
       VALUES (?, ?, ?, ?, CURDATE(), 'ACTIVE', ?, '/default-avatar.svg')`,
      [employeeCode, newUserId, departmentId ? Number(departmentId) : null, designation || 'Staff Specialist', phone || null]
    );

    const [userRow] = await query('SELECT * FROM users WHERE id = ?', [newUserId]);
    const employee = await getEmployeeForUser(newUserId);

    const token = jwt.sign(
      { id: newUserId, email: cleanEmail, role: roleName, employeeId: employee?.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: publicUser(userRow, roleName, employee),
    });
  } catch (error: any) {
    console.error('register error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// ---------------------------------------------------------------------------
// Google OAuth login
// ---------------------------------------------------------------------------

export const googleLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { email, firstName, lastName, designation, departmentId, phone, photoUrl } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email is required' });
    }
    const cleanEmail = String(email).toLowerCase().trim();

    let [userRow] = await query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!userRow) {
      // No matching user — auto-provision, per spec.
      const userCode = await nextCode('users', 'user_code', 'USER');
      const randomPassword = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);
      const result = await execute(
        `INSERT INTO users (user_code, email, password_hash, first_name, last_name, profile_photo, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [userCode, cleanEmail, randomPassword, firstName || '', lastName || '', photoUrl || null]
      );
      const roleId = await getRoleId('Employee');
      await execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [result.insertId, roleId]);

      const employeeCode = await nextCode('employees', 'employee_code', 'EMP');
      await execute(
        `INSERT INTO employees (employee_code, user_id, department_id, designation, joining_date, employment_status, phone, avatar_url)
         VALUES (?, ?, ?, ?, CURDATE(), 'ACTIVE', ?, ?)`,
        [employeeCode, result.insertId, departmentId ? Number(departmentId) : null, designation || 'Staff Specialist', phone || null, photoUrl || '/default-avatar.svg']
      );
      [userRow] = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    }

    if (userRow.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'This account is not active' });
    }

    const role = await getUserRole(userRow.id);
    const employee = await getEmployeeForUser(userRow.id);

    const token = jwt.sign(
      { id: userRow.id, email: userRow.email, role, employeeId: employee?.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser(userRow, role, employee),
    });
  } catch (error: any) {
    console.error('googleLogin error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Google login failed' });
  }
};

// ---------------------------------------------------------------------------
// Current user / profile
// ---------------------------------------------------------------------------

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const [userRow] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!userRow) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const role = await getUserRole(userRow.id);
  const employee = await getEmployeeForUser(userRow.id);
  return res.json({ success: true, user: publicUser(userRow, role, employee) });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const { firstName, lastName, phone, profilePhoto, designation, departmentId } = req.body;

    await execute(
      `UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone_number = COALESCE(?, phone_number),
        profile_photo = COALESCE(?, profile_photo)
       WHERE id = ?`,
      [firstName ?? null, lastName ?? null, phone ?? null, profilePhoto ?? null, req.user.id]
    );

    if (designation !== undefined || departmentId !== undefined || phone !== undefined) {
      await execute(
        `UPDATE employees SET
          designation = COALESCE(?, designation),
          department_id = COALESCE(?, department_id),
          phone = COALESCE(?, phone)
         WHERE user_id = ?`,
        [designation ?? null, departmentId ? Number(departmentId) : null, phone ?? null, req.user.id]
      );
    }

    const [userRow] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const role = await getUserRole(req.user.id);
    const employee = await getEmployeeForUser(req.user.id);

    return res.json({ success: true, message: 'Profile updated', user: publicUser(userRow, role, employee) });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Update failed' });
  }
};

// ---------------------------------------------------------------------------
// Password reset (uses password_reset_tokens table)
// ---------------------------------------------------------------------------

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const [userRow] = await query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    // Always return success even if the user doesn't exist, to avoid leaking which emails are registered.
    if (!userRow) {
      return res.json({ success: true, message: 'If that email exists, a reset code has been sent.' });
    }

    const token = crypto.randomInt(100000, 999999).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES (?, ?, ?, 0)',
      [userRow.id, token, expiresAt]
    );

    // TODO: wire an actual email/SMS provider here. For now the code is returned
    // only in non-production so the flow is testable end-to-end.
    return res.json({
      success: true,
      message: 'If that email exists, a reset code has been sent.',
      ...(process.env.NODE_ENV !== 'production' ? { devCode: token } : {}),
    });
  } catch (error: any) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Request failed' });
  }
};

export const verifyResetCode = async (req: AuthRequest, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const rows = await query(
      `SELECT prt.* FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE LOWER(u.email) = ? AND prt.token = ? AND prt.used = 0 AND prt.expires_at > NOW()
       ORDER BY prt.id DESC LIMIT 1`,
      [cleanEmail, code]
    );
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
    return res.json({ success: true, message: 'Code verified' });
  } catch (error: any) {
    console.error('verifyResetCode error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Verification failed' });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, code and new password are required' });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const rows = await query(
      `SELECT prt.*, u.id AS user_id FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE LOWER(u.email) = ? AND prt.token = ? AND prt.used = 0 AND prt.expires_at > NOW()
       ORDER BY prt.id DESC LIMIT 1`,
      [cleanEmail, code]
    );
    const tokenRow = rows[0];
    if (!tokenRow) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    await execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, tokenRow.user_id]);
    await execute('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokenRow.id]);

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Reset failed' });
  }
};

// NOTE: The old `switchUser` endpoint (log in as any user by supplying just an
// email, with no auth check) has been intentionally removed. It was an
// unauthenticated account-takeover backdoor left over from demo/dev builds.
// If you need an admin "impersonate user" feature, rebuild it as a POST that
// requires authenticateToken + authorizeRoles('Admin') and logs to audit_logs.
