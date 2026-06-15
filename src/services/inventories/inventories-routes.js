import { Router } from 'express';
import { createInventory } from './inventories-controller.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { upload } from '../../utils/cloudinary.js';


const router = Router();

router.post('/inventories', authenticateToken, checkRole(['super_admin', 'admin_sekre']), upload.single('image'), createInventory);

export default router;