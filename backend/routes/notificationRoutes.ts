import { Router } from 'express';
import { getNotifications, markAsRead, dispatchNotification } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/dispatch', dispatchNotification);

export default router;
