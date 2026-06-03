import { Router } from 'express';
import { createAttendaces, getAttendancesByEventId, getAttendancesByUserId } from './attendances-controller.js';
import { createAttendanceSchema } from './attendances-schema.js';
import { validate } from '../../middlewares/validate.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';

const router = Router();

router.post('/attendances', authenticateToken, validate(createAttendanceSchema), createAttendaces);
router.get('/attendances/:id', authenticateToken, checkRole(['super_admin', 'admin_psdm']), getAttendancesByEventId);
router.get('/my-attendances', authenticateToken, getAttendancesByUserId);

export default router;