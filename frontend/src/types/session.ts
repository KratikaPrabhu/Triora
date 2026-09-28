export type SessionStatus = 'created' | 'active' | 'completed' | 'failed';

export interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
  status?: 'answered' | 'silent' | 'skipped' | 'recognition_error' | 'cancelled';
  timestamp?: string;
  voiceMetrics?: {
    duration?: number;
    avgFrequency?: number;
    minFrequency?: number;
    maxFrequency?: number;
    samples?: Array<{ time: number; frequency: number }>;
  };
}

export interface Session {
  _id: string;
  userId: string;
  status: SessionStatus;
  language: string;
  startedAt?: string | null;
  completedAt?: string | null;
  metadata?: Record<string, any>;
  transcript: SessionMessage[];
  reportId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SpeechToken {
  token: string;
  region: string;
  voice: string;
  locale: string;
  recognitionLocales: string[];
  expiresAt: string;
}
