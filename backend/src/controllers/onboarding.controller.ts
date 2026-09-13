import { Request, Response } from 'express';
import onboardingService from '../services/onboarding.service';
import asyncWrapper from '../utils/asyncWrapper';

export const getOnboarding = asyncWrapper(async (req: Request, res: Response) => {
  const result = await onboardingService.getOnboarding(req.user!._id.toString());
  res.status(200).json({
    success: true,
    data: result
  });
});

export const updateOnboarding = asyncWrapper(async (req: Request, res: Response) => {
  const result = await onboardingService.updateOnboarding(req.user!._id.toString(), req.body);
  res.status(200).json({
    success: true,
    data: result
  });
});
