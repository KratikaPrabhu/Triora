import { Request, Response } from 'express';
import healthService from '../services/health.service';
import asyncWrapper from '../utils/asyncWrapper';

export const getHealth = asyncWrapper(async (_req: Request, res: Response) => {
  const healthData = healthService.getHealthStatus();
  res.status(200).json(healthData);
});
