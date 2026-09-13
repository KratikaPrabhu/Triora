import { Request, Response } from 'express';
import reportService from '../services/report.service';
import asyncWrapper from '../utils/asyncWrapper';

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
  const report = await reportService.getReportById(req.user!._id.toString(), id);
  res.status(200).json({
    success: true,
    data: { report }
  });
});
