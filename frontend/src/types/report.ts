export interface VoiceAnalysisResponse {
  responseIndex: number;
  questionText: string;
  responseText: string;
  duration?: number;
  avgFrequency?: number;
  minFrequency?: number;
  maxFrequency?: number;
}

export interface VoiceAnalysis {
  totalDuration?: number;
  averageFrequency?: number;
  minFrequency?: number;
  maxFrequency?: number;
  samplesCount?: number;
  samples?: Array<{ timeOffset: number; frequency: number }>;
  responses?: VoiceAnalysisResponse[];
}

export interface Report {
  _id: string;
  sessionId: string;
  userId: string;
  summary: string;
  keyThemes: string[];
  concerns: string[];
  emotionalContext: string;
  importantStatements: string[];
  conversationOverview: string;
  voiceAnalysis?: VoiceAnalysis | null;
  generatedAt: string;
  modelName?: string;
  version?: string;
  createdAt: string;
  updatedAt: string;
}
