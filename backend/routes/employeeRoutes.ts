import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorizeRoles(['Admin', 'Manager', 'Department Head', 'HR Specialist']), createEmployee);
router.put('/:id', authorizeRoles(['Admin', 'Manager', 'Department Head', 'HR Specialist']), updateEmployee);
router.delete('/:id', authorizeRoles(['Admin']), deleteEmployee);

export default router;
