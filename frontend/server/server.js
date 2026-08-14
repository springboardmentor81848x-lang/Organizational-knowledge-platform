import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import fs from 'fs';
import pool from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'knowledgeiq_super_secret_jwt_key_2026';

// ─── Upload directory setup ───────────────────────────────────────────────────
const UPLOAD_DIR = join(__dirname, 'uploads', 'profile');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Multer storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `profile_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, and PNG images are allowed.'));
    }
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Serve uploaded files as static assets
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// ─── Helper: sign JWT ─────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, systemRole: user.system_role, fullName: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─── Helper: auth middleware ──────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Ensure schema (users + new profile columns) ──────────────────────────────
async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        manager_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        department_id UUID REFERENCES departments(id),
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        system_role TEXT NOT NULL DEFAULT 'EMPLOYEE',
        department_id UUID REFERENCES departments(id),
        role_id UUID REFERENCES roles(id),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Add profile columns if they don't exist yet
    const profileCols = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'Northwind Labs'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role_title TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS experience TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS education TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT`,
    ];
    for (const sql of profileCols) {
      await client.query(sql);
    }

    console.log('✅ Schema verified / ensured (including profile columns).');
  } catch (err) {
    console.error('Schema check warning:', err.message);
  } finally {
    client.release();
  }
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const systemRoleMap = { employee: 'EMPLOYEE', hr: 'HR_SPECIALIST', admin: 'SYSTEM_ADMIN' };
  const systemRole = systemRoleMap[role] || 'EMPLOYEE';

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name, system_role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email, full_name, system_role, avatar_url`,
      [email.toLowerCase().trim(), passwordHash, fullName.trim(), systemRole]
    );
    const newUser = result.rows[0];
    const token = signToken(newUser);
    console.log(`✅ New user registered: ${newUser.email} [${systemRole}]`);
    return res.status(201).json({
      token,
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      systemRole: newUser.system_role,
      avatarUrl: newUser.avatar_url,
      roleTitle: systemRole === 'EMPLOYEE' ? 'Employee' : systemRole === 'HR_SPECIALIST' ? 'HR Specialist' : 'Administrator',
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  } finally {
    client.release();
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT u.id, u.email, u.password_hash, u.full_name, u.system_role, u.avatar_url,
              u.profile_image, u.company, u.role_title, u.bio,
              r.title AS role_title_from_role
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1 AND u.is_active = true`,
      [email.toLowerCase().trim()]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = signToken(user);
    console.log(`✅ User logged in: ${user.email}`);
    return res.json({
      token,
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      systemRole: user.system_role,
      avatarUrl: user.profile_image || user.avatar_url,
      roleTitle: user.role_title || user.role_title_from_role || (user.system_role === 'EMPLOYEE' ? 'Employee' : user.system_role === 'HR_SPECIALIST' ? 'HR Specialist' : 'Administrator'),
      company: user.company || 'Northwind Labs',
      bio: user.bio || '',
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  } finally {
    client.release();
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
app.get('/api/auth/me', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT u.id, u.email, u.full_name, u.system_role, u.avatar_url, u.profile_image,
              u.company, u.role_title, u.bio, r.title AS role_title_from_role
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND u.is_active = true`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    const user = result.rows[0];
    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      systemRole: user.system_role,
      avatarUrl: user.profile_image || user.avatar_url,
      roleTitle: user.role_title || user.role_title_from_role,
      company: user.company || 'Northwind Labs',
      bio: user.bio || '',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user.' });
  } finally {
    client.release();
  }
});

// ─── GET /api/profile ─────────────────────────────────────────────────────────
app.get('/api/profile', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT u.id, u.email, u.full_name, u.system_role, u.avatar_url, u.profile_image,
              u.company, u.role_title, u.experience, u.education, u.bio,
              r.title AS role_title_from_role
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND u.is_active = true`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found.' });
    const u = result.rows[0];
    return res.json({
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      name: u.full_name,
      systemRole: u.system_role,
      profileImage: u.profile_image ? `/uploads/profile/${u.profile_image.split('/').pop()}` : (u.avatar_url || null),
      company: u.company || 'Northwind Labs',
      role: u.role_title || u.role_title_from_role || 'Employee',
      roleTitle: u.role_title || u.role_title_from_role,
      experience: u.experience || '',
      education: u.education || '',
      bio: u.bio || '',
    });
  } catch (err) {
    console.error('Profile GET error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch profile.' });
  } finally {
    client.release();
  }
});

// ─── PUT /api/profile ─────────────────────────────────────────────────────────
app.put('/api/profile', requireAuth, upload.single('profileImage'), async (req, res) => {
  const { fullName, email, company, role, experience, education, bio } = req.body;

  // Validate
  if (!fullName?.trim()) return res.status(400).json({ error: 'Full name is required.' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email?.trim() || !emailRegex.test(email)) return res.status(400).json({ error: 'A valid email is required.' });

  const client = await pool.connect();
  try {
    // Check email uniqueness (excluding current user)
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email.toLowerCase().trim(), req.user.id]
    );
    if (emailCheck.rows.length > 0) return res.status(409).json({ error: 'This email is already in use by another account.' });

    // If a new image was uploaded, delete the old one
    let profileImagePath = null;
    if (req.file) {
      // Get old image path
      const oldResult = await client.query('SELECT profile_image FROM users WHERE id = $1', [req.user.id]);
      const oldImage = oldResult.rows[0]?.profile_image;
      if (oldImage) {
        const oldPath = join(UPLOAD_DIR, oldImage.split('/').pop());
        fs.unlink(oldPath, () => {}); // Non-blocking delete
      }
      profileImagePath = `/uploads/profile/${req.file.filename}`;
    }

    // Build dynamic UPDATE
    const updates = [
      'full_name = $1',
      'email = $2',
      'company = $3',
      'role_title = $4',
      'experience = $5',
      'education = $6',
      'bio = $7',
      'updated_at = NOW()',
    ];
    const values = [
      fullName.trim(),
      email.toLowerCase().trim(),
      company?.trim() || 'Northwind Labs',
      role?.trim() || '',
      experience?.trim() || '',
      education?.trim() || '',
      bio?.trim() || '',
    ];

    if (profileImagePath) {
      updates.push(`profile_image = $${values.length + 1}`);
      values.push(profileImagePath);
    }
    values.push(req.user.id);

    const result = await client.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length}
       RETURNING id, email, full_name, system_role, profile_image, avatar_url, company, role_title, experience, education, bio`,
      values
    );

    const u = result.rows[0];
    console.log(`✅ Profile updated: ${u.email}`);
    return res.json({
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      name: u.full_name,
      systemRole: u.system_role,
      profileImage: u.profile_image || u.avatar_url || null,
      company: u.company || 'Northwind Labs',
      role: u.role_title || 'Employee',
      roleTitle: u.role_title,
      experience: u.experience || '',
      education: u.education || '',
      bio: u.bio || '',
    });
  } catch (err) {
    console.error('Profile PUT error:', err.message);
    // Clean up uploaded file if DB update failed
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ error: 'Profile update failed. Please try again.' });
  } finally {
    client.release();
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Multer error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image must be smaller than 5 MB.' });
  }
  if (err?.message) return res.status(400).json({ error: err.message });
  return res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
ensureSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 KnowledgeIQ API server running on http://localhost:${PORT}`);
    console.log(`   GET  /api/profile`);
    console.log(`   PUT  /api/profile  (multipart/form-data OR JSON)`);
    console.log(`   Static uploads → /uploads/profile/`);
  });
});
