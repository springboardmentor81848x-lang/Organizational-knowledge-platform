import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// All authenticated users can view system configuration & platform status
router.get('/', getSettings);

// Settings modifications restricted to Admin
router.put('/', authorizeRoles(['Admin']), updateSettings);

export default router;
