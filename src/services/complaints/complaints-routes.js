import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { uploadEvidence } from '../../utils/cloudinary.js';
import { createComplaint, getAllComplaints, getComplaintById, updateComplaintById } from './complaints-controller.js';
import { createComplaintSchema, updateComplaintStatusSchema } from './complaints-schema.js';

const router = Router();

// Publik
router.post('/complaints', uploadEvidence.array('evidences'), validate(createComplaintSchema), createComplaint);

// Internal
router.get('/complaints', authenticateToken, checkRole(['super_admin', 'admin_advokes']), getAllComplaints);
router.get('/complaints/:id', authenticateToken, checkRole(['super_admin', 'admin_advokes']), getComplaintById);
router.patch('/complaints/:id', authenticateToken, checkRole(['super_admin', 'admin_advokes']), validate(updateComplaintStatusSchema), updateComplaintById);

export default router;