import express from 'express';
import rateLimit from 'express-rate-limit';
import { getSpeechToken } from '../controllers/speech.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = express.Router();

// Dedicated rate limiter for speech token requests (30 requests / 15 minutes per IP)
const speechLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many speech token requests, please try again later',
      statusCode: 429
    }
  }
});

router.get('/token', authenticateJWT, speechLimiter, getSpeechToken);

export default router;
