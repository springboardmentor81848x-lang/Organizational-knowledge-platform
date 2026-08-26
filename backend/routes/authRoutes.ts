import { Router } from 'express';
import {
  login,
  register,
  googleLogin,
  getMe,
  updateProfile,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);

// The old /switch-user route (impersonate any user, no auth required) has
// been removed — see authController.ts for why.

export default router;
