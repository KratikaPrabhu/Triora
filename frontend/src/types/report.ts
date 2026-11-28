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
  speechDuration?: number;
  averageFrequency?: number;
  minFrequency?: number;
  maxFrequency?: number;
  samplesCount?: number;
  samples?: Array<{ timeOffset: number; frequency: number }>;
  responses?: VoiceAnalysisResponse[];
}

export interface PhysiologicalMetrics {
  meanGSR: number;
  peakConductance: number;
  minConductance?: number;
  spikeCount: number;
  spikes?: Array<{ timestamp: string; value: number; relativeSecond: number; contextTopic?: string }>;
  avgHeartRate: number;
  restingHeartRateBaseline?: number;
  stressDistribution?: {
    calmPercent: number;
    moderatePercent: number;
    highPercent: number;
  };
}

export interface QuestionPhysiologicalMetrics {
  meanGSR: number;
  peakConductance: number;
  minConductance: number;
  deltaConductance: number;
  meanResistance: number;
  deltaResistance: number;
  avgHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  deltaHeartRate: number;
  avgHRV: number;
  deltaHRV: number;
  sampleCount: number;
  durationSeconds: number;
}

export interface QuestionPhysiologicalResponse {
  questionIndex: number;
  questionText: string;
  responseText: string;
  durationSeconds: number;
  metrics: QuestionPhysiologicalMetrics;
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
  physiologicalInsights?: string;
  physiologicalMetrics?: PhysiologicalMetrics | null;
  questionPhysiologicalResponses?: QuestionPhysiologicalResponse[];
  duration?: number;
  voiceAnalysis?: VoiceAnalysis | null;
  generatedAt: string;
  modelName?: string;
  version?: string;
  createdAt: string;
  updatedAt: string;
}
