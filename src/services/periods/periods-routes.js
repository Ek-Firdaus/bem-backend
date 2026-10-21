import { Router } from 'express';
import { getPeriods, createPeriod, updatePeriod, getPeriodById, deletePeriod } from './periods-controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { createPeriodSchema, updatePeriodSchema } from './periods-schema.js';
import { upload } from '../../utils/cloudinary.js';

const router = Router();

router.post('/periods', authenticateToken, checkRole(['super_admin']), upload.single('logo'), validate(createPeriodSchema), createPeriod);
router.get('/periods', authenticateToken, checkRole(['super_admin']), getPeriods);
router.get('/periods/:id', authenticateToken, checkRole(['super_admin']), getPeriodById);
router.put('/periods/:id', authenticateToken, checkRole(['super_admin']), upload.single('logo'), validate(updatePeriodSchema), updatePeriod);
router.delete('/periods/:id', authenticateToken, checkRole(['super_admin']), deletePeriod);

export default router;