import { Router } from 'express';
import {
  getMentorships,
  getAdminMentorRequests,
  getMentorshipHistory,
  getMentorRecommendations,
  getMentorDetails,
  getExpertDirectory,
  getReceivedRequests,
  getSentRequests,
  getActiveMentorships,
  requestMentorship,
  recommendMentor,
  approveMentorship,
  rejectMentorship,
  updateMentorshipStatus,
  completeMentorship,
  cancelMentorship,
} from '../controllers/mentorshipController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Queries & Admin Management
router.get('/', getMentorships);
router.get('/admin/requests', getAdminMentorRequests);
router.get('/recommendations', getMentorRecommendations);
router.get('/received', getReceivedRequests);
router.get('/sent', getSentRequests);
router.get('/my-requests', getSentRequests);
router.get('/active', getActiveMentorships);
router.get('/experts', getExpertDirectory);
router.get('/mentors/:id', getMentorDetails);
router.get('/experts/:id', getMentorDetails);
router.get('/:id/history', getMentorshipHistory);

// Employee Requests
router.post('/', requestMentorship);
router.post('/request', requestMentorship);

// Admin Governance Actions (Recommend, Approve, Reject)
router.post('/:id/recommend', recommendMentor);
router.put('/:id/recommend', recommendMentor);
router.post('/:id/approve', approveMentorship);
router.put('/:id/approve', approveMentorship);
router.post('/:id/reject', rejectMentorship);
router.put('/:id/reject', rejectMentorship);

// Mentor's own accept action on a request sent directly to them —
// distinct from Admin/HR's governance approval (POST/PUT /:id/approve).
router.put('/:id/accept', updateMentorshipStatus);
router.put('/:id/status', updateMentorshipStatus);
router.put('/:id/complete', completeMentorship);
router.put('/:id/cancel', cancelMentorship);

export default router;
