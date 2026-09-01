import { Router } from 'express';
import {
  getTargetRoles,
  getTargetRoleById,
  getTargetRoleGapAnalysis,
  assignEmployeeTargetRole,
  createTargetRole,
} from '../controllers/targetRoleController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTargetRoles);
router.get('/:id', getTargetRoleById);
router.get('/:id/gap-analysis/:employeeId', getTargetRoleGapAnalysis);
router.put('/employee/:id', assignEmployeeTargetRole);
router.post('/', createTargetRole);

export default router;
