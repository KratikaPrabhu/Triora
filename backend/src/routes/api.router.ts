import express from 'express';
import healthRouter from './health.router';
import authRouter from './auth.router';
import onboardingRouter from './onboarding.router';
import sessionRouter from './session.router';
import speechRouter from './speech.router';
import reportRouter from './report.router';

const router = express.Router();

router.use('/', healthRouter);
router.use('/auth', authRouter);
router.use('/onboarding', onboardingRouter);
router.use('/sessions', sessionRouter);
router.use('/speech', speechRouter);
router.use('/report', reportRouter);

export default router;


