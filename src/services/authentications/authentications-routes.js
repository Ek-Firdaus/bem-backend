import { Router } from 'express';
import { login, refreshToken, logout } from './authentications-controller.js';
import { validate } from '../../middlewares/validate.js';
import { loginSchema, refreshTokenSchema } from './authentications-schema.js';
import { authenticateToken } from '../../middlewares/auth.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.put('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.delete('/logout', validate(refreshTokenSchema), authenticateToken, logout);

export default router;