import { Router } from 'express';
import { createEvent, getEvents, updateEvent } from './events-controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { createEventSchema, updateEventSchema } from './events-schema.js';

const router = Router();

router.post('/events', authenticateToken, checkRole(['super_admin', 'admin_psdm']), validate(createEventSchema), createEvent);
router.put('/events/:id', authenticateToken, checkRole(['super_admin', 'admin_psdm']), validate(updateEventSchema), updateEvent);
router.get('/events', authenticateToken, getEvents);
export default router;