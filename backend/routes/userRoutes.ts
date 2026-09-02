import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// All authenticated users can view user directory (for messaging, collaboration, mentorship)
router.get('/', getUsers);

// Administrative operations restricted to Admin
router.post('/', authorizeRoles(['Admin']), createUser);
router.put('/:id', authorizeRoles(['Admin']), updateUser);
router.delete('/:id', authorizeRoles(['Admin']), deleteUser);

export default router;
