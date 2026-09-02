import { Router } from 'express';
import {
  getLearningResources,
  getEmployeeLearningPath,
  completePathItem,
  getTeamLearningSummary,
} from '../controllers/learningPathController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/resources', getLearningResources);
router.get('/team/summary', getTeamLearningSummary);
router.get('/:employeeId', getEmployeeLearningPath);
router.put('/items/:itemId/complete', completePathItem);

export default router;
