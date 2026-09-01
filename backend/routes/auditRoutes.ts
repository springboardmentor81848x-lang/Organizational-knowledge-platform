import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getAuditLogs);

export default router;
