import { Router } from 'express';
import { getKnowledgeGaps, getGapAnalytics, resolveGap, getHeatmapData } from '../controllers/gapController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getKnowledgeGaps);
router.get('/analytics', getGapAnalytics);
router.get('/heatmap', getHeatmapData);
router.put('/:id/resolve', authorizeRoles(['Admin', 'Manager', 'Department Head', 'HR Specialist', 'L&D Admin', 'L&D Admin / Mentor']), resolveGap);

export default router;
