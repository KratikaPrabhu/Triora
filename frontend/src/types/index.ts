export interface UserProfile {
  phone?: string;
  preferredLanguage?: string;
  age?: number | null;
  emergencyContact?: string;
  bio?: string;
  preferredName?: string;
  dateOfBirth?: string | Date | null;
  backgroundInfo?: string;
  previousTherapyExperience?: 'none' | 'some' | 'extensive' | 'prefer_not_to_say' | '';
  primaryGoals?: string[];
  communicationPreference?: 'voice' | 'text' | 'both' | '';
  consentAcknowledged?: boolean;
  termsAccepted?: boolean;
  currentStep?: number;
  isOnboardingComplete?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  authProvider: 'local' | 'google';
  googleId?: string | null;
  profile?: UserProfile;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OnboardingData {
  currentStep?: number;
  preferredName?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  backgroundInfo?: string;
  previousTherapyExperience?: 'none' | 'some' | 'extensive' | 'prefer_not_to_say' | '';
  primaryGoals?: string[];
  communicationPreference?: 'voice' | 'text' | 'both' | '';
  consentAcknowledged?: boolean;
  termsAccepted?: boolean;
}

export interface OnboardingResponse {
  currentStep: number;
  isOnboardingComplete: boolean;
  profile: UserProfile;
}

export interface TranscriptMessage {
  id?: string;
  role: 'user' | 'assistant';
  text: string;
  status?: 'answered' | 'silent' | 'skipped' | 'recognition_error' | 'cancelled';
  timestamp?: string;
  metadata?: {
    intent?: string;
    topic?: string;
    shouldContinue?: boolean;
  };
}

export interface Session {
  id: string;
  _id?: string;
  userId: string;
  status: 'created' | 'active' | 'completed' | 'failed';
  language: string;
  transcript: TranscriptMessage[];
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HeatmapHistoryPoint {
  timestamp: string;
  conductance: number; // in µS
  resistance: number;  // in kΩ
}

export interface HeatmapDataPoint {
  timestamp: string;
  intensity: number; // 0.0 to 1.0
  emotion: string;
  topic: string;
}

export interface SessionHeatmapResponse {
  sessionId: string;
  userId: string;
  totalPoints: number;
  averageIntensity: number;
  peakIntensityTimestamp: string | null;
  conductance?: number;
  resistance?: number;
  timestamp?: string;
  history?: HeatmapHistoryPoint[];
  timeline: HeatmapDataPoint[];
}

export interface Report {
  id: string;
  _id?: string;
  sessionId: string;
  userId: string;
  summary: string;
  keyThemes: string[];
  concerns: string[];
  emotionalContext: string;
  importantStatements: string[];
  conversationOverview: string;
  generatedAt: string;
  modelName?: string;
  version?: string;
}

export interface SpeechTokenResponse {
  token: string;
  region: string;
  voice: string;
  expiresAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
  };
}

export type WSClientMessage =
  | { type: 'start_session'; sessionId: string }
  | { type: 'user_message'; sessionId: string; text: string; status?: 'answered' | 'silent' | 'skipped' }
  | { type: 'end_session'; sessionId: string };

export type WSServerMessage =
  | { type: 'session_started'; sessionId: string; status: string }
  | { type: 'processing'; sessionId: string }
  | { type: 'assistant_message'; sessionId: string; text: string; action?: string; metadata?: any; timestamp?: string }
  | { type: 'session_completed'; sessionId: string; status: string; reason?: string }
  | { type: 'conversation_error'; code?: string; message: string }
  | { type: 'error'; message: string };
