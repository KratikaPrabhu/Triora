import { Document, Types } from 'mongoose';

export interface IJWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IUserProfile {
  phone: string;
  preferredLanguage: string;
  age: number | null;
  emergencyContact: string;
  bio: string;
  preferredName: string;
  dateOfBirth: Date | null;
  backgroundInfo: string;
  previousTherapyExperience: 'none' | 'some' | 'extensive' | 'prefer_not_to_say' | '';
  primaryGoals: string[];
  communicationPreference: 'voice' | 'text' | 'both' | '';
  consentAcknowledged: boolean;
  termsAccepted: boolean;
  currentStep: number;
  isOnboardingComplete: boolean;
}

export interface IUser {
  name: string;
  email: string;
  passwordHash?: string;
  authProvider: 'local' | 'google';
  googleId?: string | null;
  profile: IUserProfile;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document<Types.ObjectId> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type SessionStatus = 'created' | 'active' | 'completed' | 'failed';

export interface ISessionMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

export interface ISession {
  userId: Types.ObjectId;
  status: SessionStatus;
  language: string;
  startedAt: Date | null;
  completedAt: Date | null;
  metadata: Record<string, any>;
  transcript: ISessionMessage[];
  reportId: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISessionDocument extends ISession, Document<Types.ObjectId> {}

export interface IReport {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  summary: string;
  keyThemes: string[];
  concerns: string[];
  emotionalContext: string;
  importantStatements: string[];
  conversationOverview: string;
  generatedAt?: Date;
  modelName?: string;
  version?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IReportDocument extends IReport, Document<Types.ObjectId> {}

export interface ApiResponse<T = any> {

  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: any;
    stack?: string;
  };
}
