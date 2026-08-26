import { Router } from 'express';
import {
  getLeaveRequests,
  getApproverInfo,
  getPendingApprovals,
  applyLeave,
  approveLeave,
  rejectLeave,
  updateLeaveStatus,
  cancelLeave,
} from '../controllers/leaveController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/approver-info', getApproverInfo);
router.get('/pending', getPendingApprovals);
router.get('/', getLeaveRequests);

router.post('/', applyLeave);

router.put('/:id/approve', approveLeave);
router.put('/:id/reject', rejectLeave);
router.put('/:id/status', updateLeaveStatus);

router.delete('/:id', cancelLeave);

export default router;
