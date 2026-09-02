import { Router } from 'express';
import {
  getTrainings,
  createTraining,
  getTrainingRecommendations,
  enrollTraining,
  getAssignments,
  getAssignmentById,
  assignTraining,
  updateAssignmentProgress,
  updateModuleProgress,
  updateMilestoneStatus,
  certifyAssignment,
  renewCertification,
  getLearningVelocityAnalytics,
} from '../controllers/trainingController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTrainings);
router.get('/programs', getTrainings);
router.post('/', authorizeRoles(['Admin', 'Manager', 'Department Head', 'L&D Admin', 'L&D Admin / Mentor', 'HR Specialist']), createTraining);
router.get('/recommendations', getTrainingRecommendations);
router.post('/enroll', enrollTraining);
router.get('/assignments', getAssignments);
router.get('/assignments/:id', getAssignmentById);
router.post('/assign', authorizeRoles(['Admin', 'Manager', 'Department Head', 'L&D Admin', 'L&D Admin / Mentor', 'HR Specialist']), assignTraining);
router.put('/assignments/:id/progress', updateAssignmentProgress);
router.put('/assignments/:id/modules/:moduleId', updateModuleProgress);
router.put('/assignments/:id/milestones/:milestoneId', updateMilestoneStatus);
router.put('/assignments/:id/certify', certifyAssignment);
router.put('/assignments/:id/renew', renewCertification);
router.get('/analytics/velocity', getLearningVelocityAnalytics);

export default router;
