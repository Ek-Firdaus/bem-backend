import { Router } from 'express';
import { createUser } from './users-controller.js';
import { createUserSchema } from './users-schema.js';
// import { authenticateToken } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();

router.post('/users', validate(createUserSchema), createUser);

export default router;