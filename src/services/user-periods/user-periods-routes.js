import { Router } from 'express';
import { getAllUserPeriods, getUserPeriodById, createUserPeriod, updateUserPeriod, deleteUserPeriod } from './user-periods-controller.js';
import { validate } from '../../middlewares/validate.js';
import { createUserPeriodSchema, updateUserPeriodSchema } from './user-periods-schema.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { upload } from '../../utils/cloudinary.js';

const router = Router();

router.get('/user-periods', authenticateToken, checkRole(['super_admin']), getAllUserPeriods);
router.get('/user-periods/:id', authenticateToken, checkRole(['super_admin']), getUserPeriodById);
router.post('/user-periods', authenticateToken, checkRole(['super_admin']), upload.single('image'), validate(createUserPeriodSchema), createUserPeriod);
router.put('/user-periods/:id', authenticateToken, checkRole(['super_admin']), upload.single('image'), validate(updateUserPeriodSchema), updateUserPeriod);
router.delete('/user-periods/:id', authenticateToken, checkRole(['super_admin']), deleteUserPeriod);

export default router;