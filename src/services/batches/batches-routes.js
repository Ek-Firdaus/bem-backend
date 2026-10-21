import { Router } from 'express';
import { validate, parseJsonFields } from '../../middlewares/validate.js';
import { authenticateAny, authenticateToken, checkRole } from '../../middlewares/auth.js';
import { uploadOrder } from '../../utils/cloudinary.js';
import { createBatch, getBatchById, getAllBatches, deleteBatch, updateBatch } from './batches-controller.js';
import { createBatchSchema, updateBatchSchema, MAX_BATCH_IMAGES } from './batches-schema.js';

const router = Router();

router.post('/batches', authenticateToken, checkRole(['super_admin']), uploadOrder.array('image', MAX_BATCH_IMAGES), parseJsonFields(['item_fields', 'variants']), validate(createBatchSchema), createBatch);
// router.get('/batches', authenticateAny, checkRole(['super_admin']), getAllBatches);
router.put('/batches/:id', authenticateAny, checkRole(['super_admin']), uploadOrder.array('image', MAX_BATCH_IMAGES), parseJsonFields(['item_fields', 'variants', 'keep_image_ids']), validate(updateBatchSchema), updateBatch);
router.delete('/batches/:id', authenticateToken, checkRole(['super_admin']), deleteBatch);
// router.get('/batches/:id', authenticateToken, checkRole(['super_admin']), getBatchById);

router.get('/batches/:id', authenticateAny, getBatchById);
router.get('/batches', authenticateAny, getAllBatches);

export default router;