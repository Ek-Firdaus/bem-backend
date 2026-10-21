import { Router } from 'express';
import { getRoles, getRoleById, createRole, updateRole, deleteRole, getRolePermissions, updateRolePermissions } from './roles-controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { createRoleSchema, updateRoleSchema, updateRolePermissionsSchema } from './roles-schema.js';

const router = Router();

router.get('/roles', authenticateToken, checkRole(['super_admin']), getRoles);
router.get('/roles/:id', authenticateToken, checkRole(['super_admin']), getRoleById);
router.post('/roles', authenticateToken, checkRole(['super_admin']), validate(createRoleSchema), createRole);
router.put('/roles/:id', authenticateToken, checkRole(['super_admin']), validate(updateRoleSchema), updateRole);
router.delete('/roles/:id', authenticateToken, checkRole(['super_admin']), deleteRole);

router.get('/roles/:id/permissions', authenticateToken, checkRole(['super_admin']), getRolePermissions);
router.put('/roles/:id/permissions', authenticateToken, checkRole(['super_admin']), validate(updateRolePermissionsSchema), updateRolePermissions);

export default router;