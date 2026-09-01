import { Router } from 'express';
import {
  getEmployeeReport,
  getGapReport,
  getEmployeeSpecificReport,
  getDepartmentSpecificReport,
  getTrainingEffectivenessReport,
} from '../controllers/reportController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Reports accessible to Admin, Manager, HR Specialist, Department Head, L&D Admin / Mentor
router.get('/employees', authorizeRoles(['Admin', 'Manager', 'HR Specialist', 'Department Head', 'L&D Admin', 'L&D Admin / Mentor']), getEmployeeReport);
router.get('/employee/:id', getEmployeeSpecificReport);
router.get('/department/:id', authorizeRoles(['Admin', 'Manager', 'HR Specialist', 'Department Head', 'L&D Admin', 'L&D Admin / Mentor']), getDepartmentSpecificReport);
router.get('/gaps', getGapReport);
router.get('/trainings', getTrainingEffectivenessReport);
router.get('/training-effectiveness', getTrainingEffectivenessReport);

export default router;
