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

export const generateTTSController = asyncWrapper(async (req: Request, res: Response) => {
  const text = req.body.text || req.query.text;
  const languageCode = req.body.languageCode || req.body.language || req.query.languageCode || req.query.language || req.query.lang;

  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Text parameter is required for speech synthesis.',
        statusCode: 400
      }
    });
    return;
  }

  const audioBuffer = await speechService.generateTTS(text.trim(), languageCode as string);

  res.set({
    'Content-Type': 'audio/mpeg',
    'Content-Length': audioBuffer.length.toString(),
    'Accept-Ranges': 'bytes'
  });

  res.status(200).send(audioBuffer);
});
