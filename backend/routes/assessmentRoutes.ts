import { Router } from 'express';
import { getAssessments, getAssessmentById, submitAssessment, getAssessmentHistory, evaluateSkill } from '../controllers/assessmentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getAssessments);
router.get('/history', getAssessmentHistory);
router.get('/:id', getAssessmentById);
router.post('/evaluate', evaluateSkill);
router.post('/:id/submit', submitAssessment);

export default router;

