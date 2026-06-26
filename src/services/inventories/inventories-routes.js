import { Router } from 'express';
import { createInventory, updateInventory, getInventoryById, getAllInventories, getInventoryByToken, updateInventoryStatus, printAllQR, printSingleQR, deleteInvetories } from './inventories-controller.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { upload } from '../../utils/cloudinary.js';
import { validate } from '../../middlewares/validate.js';
import { createInventorySchema, updateInventorySchema } from './inventories-schema.js';

const router = Router();

router.get('/inventories/print-qr', authenticateToken, checkRole(['super_admin', 'admin_sekre']), printAllQR);
router.post('/inventories', authenticateToken, checkRole(['super_admin', 'admin_sekre']), upload.single('image'), validate(createInventorySchema), createInventory);
router.put('/inventories/:id', authenticateToken, checkRole(['super_admin', 'admin_sekre']), upload.single('image'), validate(updateInventorySchema), updateInventory);
router.get('/inventories/:id', authenticateToken, checkRole(['super_admin', 'admin_sekre']), getInventoryById);
router.get('/inventories', authenticateToken, checkRole(['super_admin', 'admin_sekre']), getAllInventories);
router.delete('/inventories/:id', authenticateToken, checkRole(['super_admin', 'admin_sekre']), deleteInvetories);
router.get('/inventories/qr/:token', authenticateToken, checkRole(['super_admin', 'admin_sekre']), getInventoryByToken);
router.patch('/inventories/:id/status', authenticateToken, checkRole(['super_admin', 'admin_sekre']), updateInventoryStatus);
router.get('/inventories/:id/print-qr', authenticateToken, checkRole(['super_admin', 'admin_sekre']), printSingleQR);
export default router;