import { z } from 'zod';

export const sessionMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  text: z.string().min(1, 'Message text is required'),
  timestamp: z.string().or(z.date()).optional()
});

export const createSessionSchema = z.object({
  language: z.string().min(2).max(10).optional(),
  metadata: z.record(z.any()).optional()
});

export const updateSessionSchema = z.object({
  status: z.enum(['created', 'active', 'completed', 'failed']).optional(),
  language: z.string().min(2).max(10).optional(),
  metadata: z.record(z.any()).optional(),
  transcript: z.array(sessionMessageSchema).optional()
});
