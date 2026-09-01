import { Router } from 'express';
import {
  getSessions,
  getSessionById,
  createSession,
  editSession,
  cancelSession,
  completeSession,
  registerForSession,
  cancelSessionRegistration,
  markAttendance,
  submitSessionFeedback,
} from '../controllers/sessionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.post('/', createSession);
router.put('/:id', editSession);
router.put('/:id/cancel', cancelSession);
router.put('/:id/complete', completeSession);
router.post('/:id/register', registerForSession);
router.post('/:id/cancel-registration', cancelSessionRegistration);
router.delete('/:id/register/:employeeId', cancelSessionRegistration);
router.put('/:id/attendance', markAttendance);
router.post('/:id/feedback', submitSessionFeedback);

export default router;
