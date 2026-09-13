import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import validateBody from '../middleware/validate.middleware';
import { authenticateJWT } from '../middleware/auth.middleware';
import { signupSchema, loginSchema, updateProfileSchema, googleAuthSchema } from '../validators/auth.validator';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again after 15 minutes',
      statusCode: 429
    }
  }
});

// Public endpoints
router.post('/signup', authLimiter, validateBody(signupSchema), authController.signup);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/google', authLimiter, validateBody(googleAuthSchema), authController.googleAuth);

// Protected endpoints
router.get('/me', authenticateJWT, authController.getMe);
router.patch('/profile', authenticateJWT, validateBody(updateProfileSchema), authController.updateProfile);

export default router;
