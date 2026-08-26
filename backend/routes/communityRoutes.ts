import { Router } from 'express';
import {
  getGroups,
  getGroupById,
  createGroup,
  joinGroup,
  leaveGroup,
  createPost,
} from '../controllers/communityController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getGroups);
router.get('/:id', authenticateToken, getGroupById);
router.post('/', authenticateToken, createGroup);
router.post('/:id/join', authenticateToken, joinGroup);
router.post('/:id/leave', authenticateToken, leaveGroup);
router.post('/:id/posts', authenticateToken, createPost);

export default router;
