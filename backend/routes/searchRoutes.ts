import { Router } from 'express';
import { globalSearch, searchExperts } from '../controllers/searchController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', globalSearch);
router.get('/experts', searchExperts);

export default router;
