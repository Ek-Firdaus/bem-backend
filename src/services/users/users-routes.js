import { Router } from 'express';
import { createUser, getAllUser, getUserById, updateUser, updatePasswordUser } from './users-controller.js';
import { createUserSchema, updatePasswordUserSchema, updateUserSchema } from './users-schema.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();

router.get('/users/profile', authenticateToken, getUserById);
router.patch('/users/profile', authenticateToken, validate(updatePasswordUserSchema), updatePasswordUser);

router.post('/users', authenticateToken, validate(createUserSchema), checkRole(['super_admin']), createUser);
router.get('/users', authenticateToken, checkRole(['super_admin']), getAllUser);
router.put('/users/:id', authenticateToken, validate(updateUserSchema), checkRole(['super_admin', 'admin_psdm']), updateUser);
// router.delete('/users/:id', authenticateToken)

export default router;