import { Router } from 'express';
import { login, refreshToken, logout, googleRedirect, googleCallback, externalRefreshToken, externalLogout, } from './authentications-controller.js';
import { validate } from '../../middlewares/validate.js';
import { loginSchema, refreshTokenSchema } from './authentications-schema.js';
import { authenticateToken } from '../../middlewares/auth.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.put('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.delete('/logout', validate(refreshTokenSchema), authenticateToken, logout);


// External users (Google). Tanpa validate(): code/state datang dari query redirect Google
// dan sudah dicek manual di controller.
router.get('/auth/google', googleRedirect);
router.get('/auth/google/callback', googleCallback);
router.post('/auth/external/refresh-token', externalRefreshToken);
router.delete('/auth/external/logout', externalLogout);


export default router;