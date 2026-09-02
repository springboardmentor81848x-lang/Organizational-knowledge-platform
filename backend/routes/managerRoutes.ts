import { Router } from 'express';
import {
  getManagerDashboard,
  getManagerEmployees,
  getSkillImprovementTrend,
  getManagerPendingLeaves,
  getEmployeeDrilldown,
} from '../controllers/managerController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles('Admin', 'Manager', 'Department Head', 'L&D Admin', 'L&D Admin / Mentor', 'HR Specialist'));

router.get('/dashboard', getManagerDashboard);
router.get('/employees', getManagerEmployees);
router.get('/skill-improvement', getSkillImprovementTrend);
router.get('/pending-leaves', getManagerPendingLeaves);
router.get('/employee-drilldown/:id', getEmployeeDrilldown);

export default router;
