import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  // Fail loudly in dev instead of silently signing tokens with a guessable
  // hardcoded fallback secret.
  console.warn('⚠️  JWT_SECRET is not set in .env — using an insecure default. Set it before deploying.');
}
export const JWT_SECRET = process.env.JWT_SECRET || 'okgip_secret_key_college_project_2026';

// Intersection type (rather than `extends Request`) so this stays robust
// even if express's own type declarations aren't resolvable yet (e.g. before
// `npm install` has run) — it still carries all of Request's members.
export type AuthRequest = Request & {
  user?: {
    id: number;
    email: string;
    role: string;
    employeeId?: number;
  };
};

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function authorizeRoles(...roles: (string | string[])[]) {
  const flattenedRoles = roles.flat();
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !flattenedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of these roles: ${flattenedRoles.join(', ')}`,
      });
    }
    next();
  };
}
