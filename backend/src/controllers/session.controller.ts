import { Request, Response } from 'express';
import sessionService from '../services/session.service';
import conversationService from '../services/conversation.service';
import asyncWrapper from '../utils/asyncWrapper';

export const createSession = asyncWrapper(async (req: Request, res: Response) => {
  const result = await sessionService.createSession(req.user!._id.toString(), req.body);
  res.status(201).json({
    success: true,
    data: result
  });
});

export const getSessions = asyncWrapper(async (req: Request, res: Response) => {
  const sessions = await sessionService.getUserSessions(req.user!._id.toString());
  res.status(200).json({
    success: true,
    data: { sessions }
  });
});

export const getSessionById = asyncWrapper(async (req: Request, res: Response) => {
  const session = await sessionService.getSessionById(req.user!._id.toString(), req.params.id as string);
  res.status(200).json({
    success: true,
    data: { session }
  });
});

export const updateSession = asyncWrapper(async (req: Request, res: Response) => {
  const session = await sessionService.updateSession(req.user!._id.toString(), req.params.id as string, req.body);
  res.status(200).json({
    success: true,
    data: { session }
  });
});

export const respondSession = asyncWrapper(async (req: Request, res: Response) => {
  const { text, status } = req.body;
  const sessionId = req.params.id as string;
  const userId = req.user!._id.toString();

  const { session, aiResponse } = await conversationService.processSessionMessage({
    userId,
    sessionId,
    userMessage: text || '',
    status: status || 'answered'
  });

  res.status(200).json({
    success: true,
    data: {
      action: aiResponse.action,
      question: aiResponse.reply,
      reason: aiResponse.reason,
      metadata: aiResponse.metadata,
      session
    }
  });
});
