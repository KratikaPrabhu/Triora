import { Request, Response } from 'express';
import speechService from '../services/speech.service';
import asyncWrapper from '../utils/asyncWrapper';

export const getSpeechToken = asyncWrapper(async (req: Request, res: Response) => {
  const langCode = (req.query.language as string) || (req.query.lang as string);
  const result = await speechService.getSpeechToken(langCode);
  res.status(200).json({
    success: true,
    data: result
  });
});
