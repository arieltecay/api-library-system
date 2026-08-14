import { Router } from 'express';
import { validate } from '../../middleware/validation.js';
import * as authController from '../../Controllers/Auth/index.js';
import { loginPinSchema, loginEmailSchema, refreshTokenSchema } from '../../Controllers/Auth/types.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.post('/login-pin', validate(loginPinSchema), authController.loginPin);
router.post('/login', validate(loginEmailSchema), authController.loginEmail);
router.post('/login-email', validate(loginEmailSchema), authController.loginEmail);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.get('/me', authMiddleware, authController.me);

export default router;