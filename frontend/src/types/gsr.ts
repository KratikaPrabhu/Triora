export type PhysiologicalParam = 'conductance' | 'resistance' | 'heartRate' | 'hrv';

export interface VitalsReading {
  timestamp: number;
  sessionElapsedSeconds: number;
  sessionId: string;
  // Conductance in microSiemens (µS), typically 2.0 - 20.0 µS
  conductance: number;
  // Resistance in kilo-ohms (kΩ), typically 50 - 500 kΩ (inversely related to conductance: R = 1000 / G)
  resistance: number;
  // Heart Rate in Beats Per Minute (BPM), typically 60 - 100 BPM
  heartRate: number;
  // Heart Rate Variability (RMSSD) in milliseconds (ms), typically 25 - 75 ms
  hrv: number;
  // Backwards compatibility ADC value
  value: number;
}

export type GSRReading = VitalsReading;

export type GSRMode = 'demo' | 'live';
export type GSRConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface VitalsStatsData {
  currentConductance: number; // in µS
  currentResistance: number;  // in kΩ
  currentHeartRate: number;   // in BPM
  currentHRV: number;         // in ms
  sessionDurationSeconds: number;
  dataPointsCount: number;
}
