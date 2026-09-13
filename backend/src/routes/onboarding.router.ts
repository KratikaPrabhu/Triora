import express from 'express';
import * as onboardingController from '../controllers/onboarding.controller';
import validateBody from '../middleware/validate.middleware';
import { authenticateJWT } from '../middleware/auth.middleware';
import { onboardingSchema } from '../validators/onboarding.validator';

const router = express.Router();

router.get('/', authenticateJWT, onboardingController.getOnboarding);
router.patch('/', authenticateJWT, validateBody(onboardingSchema), onboardingController.updateOnboarding);

export default router;
