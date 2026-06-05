import { Router } from 'express';
import { createAttendaces, getAttendancesByEventId, getAttendancesByUserId, getAllAttendances, exportAttendancesByEventId, exportAttendances } from './attendances-controller.js';
import { createAttendanceSchema } from './attendances-schema.js';
import { validate } from '../../middlewares/validate.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';

const router = Router();
router.get('/attendances/export', authenticateToken, checkRole(['super_admin', 'admin_psdm']), exportAttendances);
router.get('/attendances/:id/export', authenticateToken, checkRole(['super_admin', 'admin_psdm']), exportAttendancesByEventId);

router.post('/attendances', authenticateToken, validate(createAttendanceSchema), createAttendaces);
router.get('/attendances', authenticateToken, checkRole(['super_admin', 'admin_psdm']), getAllAttendances);
router.get('/attendances/:id', authenticateToken, checkRole(['super_admin', 'admin_psdm']), getAttendancesByEventId);
router.get('/my-attendances', authenticateToken, getAttendancesByUserId);


export default router;