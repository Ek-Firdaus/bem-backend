import { Router } from 'express';
import { createUser, getUserById, updateUser } from './users-controller.js';
import { createUserSchema, updateUserSchema } from './users-schema.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();

router.post('/users', authenticateToken, validate(createUserSchema), checkRole('super_admin'), createUser);
router.get('/users/profile', authenticateToken, getUserById);
router.patch('/users/profile', authenticateToken, validate(updateUserSchema), updateUser);

export default router;