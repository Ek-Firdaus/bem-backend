import { Router } from 'express';
import { getAllDivisions, getDivisionById, createDivision, updateDivision, deleteDivision } from './divisions-controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { createDivisionSchema, updateDivisionSchema } from './divisions-schema.js';

const router = Router();

router.get('/divisions', authenticateToken, checkRole(['super_admin']), getAllDivisions);
router.get('/divisions/:id', authenticateToken, checkRole(['super_admin']), getDivisionById);
router.post('/divisions', authenticateToken, checkRole(['super_admin']), validate(createDivisionSchema), createDivision);
router.put('/divisions/:id', authenticateToken, checkRole(['super_admin']), validate(updateDivisionSchema), updateDivision);
router.delete('/divisions/:id', authenticateToken, checkRole(['super_admin']), deleteDivision);

export default router;

