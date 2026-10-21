import { Router } from 'express';
import { createOrder, getMyOrders, getMyOrderById, uploadPaymentProof, cancelMyOrder, getAllOrders, getOrderById, updateOrderStatus } from './orders-controller.js';
import { authenticateToken, authenticateAny, onlyExternal, checkRole } from '../../middlewares/auth.js';
import { upload } from '../../utils/cloudinary.js';
import { validate, validateQuery } from '../../middlewares/validate.js';
import { createOrderSchema, updateOrderStatusSchema, getOrdersQuerySchema } from './order-schema.js';

const router = Router();

// Pembeli (login Google). '/orders/me' harus di atas '/orders/:id'
router.post('/orders', authenticateAny, onlyExternal, validate(createOrderSchema), createOrder);
router.get('/orders/me', authenticateAny, onlyExternal, getMyOrders);
router.get('/orders/me/:id', authenticateAny, onlyExternal, getMyOrderById);
router.patch('/orders/me/:id/payment-proof', authenticateAny, onlyExternal, upload.single('payment_proof'), uploadPaymentProof);
router.patch('/orders/me/:id/cancel', authenticateAny, onlyExternal, cancelMyOrder);

// Admin. Tambahkan role lain di checkRole sesuai kebutuhan
router.get('/orders', authenticateToken, checkRole(['super_admin']), validateQuery(getOrdersQuerySchema), getAllOrders);
router.get('/orders/:id', authenticateToken, checkRole(['super_admin']), getOrderById);
router.patch('/orders/:id/status', authenticateToken, checkRole(['super_admin']), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;