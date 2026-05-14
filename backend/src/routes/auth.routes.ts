import { Router } from 'express';
import { register, verifyOtp, setPassword, login, refreshAccessToken, logout, me, resendOtp } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { registerSchema, verifyOtpSchema, setPasswordSchema, loginSchema, refreshTokenSchema, resendOtpSchema } from '../schemas/auth.schema';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/set-password', validate(setPasswordSchema), setPassword);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshAccessToken);
router.post('/resend-otp', validate(resendOtpSchema), resendOtp);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
