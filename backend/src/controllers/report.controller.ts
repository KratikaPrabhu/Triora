import { Request, Response } from 'express';
import reportService from '../services/report.service';
import asyncWrapper from '../utils/asyncWrapper';
import logger from '../config/logger';

export const generateReport = asyncWrapper(async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  const report = await reportService.generateReport(req.user!._id.toString(), sessionId);
  res.status(201).json({
    success: true,
    data: { report }
  });
});

export const getReport = asyncWrapper(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userIdStr = req.user!._id.toString();
  logger.info(`[Report API] Requested ID: ${id}`);
  logger.info(`[Report API] Authenticated user: ${userIdStr}`);
  
  const report = await reportService.getReportById(userIdStr, id);
  
  logger.info(`[Report API] Report/session found: true`);
  logger.info(`[Report API] Ownership check: passed`);
  res.status(200).json({
    success: true,
    data: { report }
  });
});
