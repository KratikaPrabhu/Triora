import type { VitalsReading } from '../../types/gsr';

export type VitalsReadingCallback = (reading: VitalsReading) => void;

/**
 * DemoGSRService simulates realistic physiological vitals:
 * 1. Conductance (µS): 3.0 - 15.0 µS baseline with natural phasic peaks (arousal spikes)
 * 2. Resistance (kΩ): Inversely proportional R ≈ 1000 / G (e.g. 5.2 µS ≈ 192 kΩ)
 * 3. Heart Rate (BPM): 68 - 85 BPM with respiratory sinus arrhythmia
 * 4. HRV (RMSSD in ms): 40 - 65 ms
 */
export class DemoGSRService {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private sessionId: string = '';
  private elapsedSeconds: number = 0;
  
  // States
  private baselineConductance: number = 4.8;
  private phasicArousal: number = 0;
  private baselineHR: number = 72;
  private baselineHRV: number = 48;
  
  private listeners: Set<VitalsReadingCallback> = new Set();
  private isRunning: boolean = false;

  constructor(sessionId: string = '') {
    this.sessionId = sessionId;
  }

  public setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  public subscribe(callback: VitalsReadingCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public start(initialElapsed: number = 0): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.elapsedSeconds = initialElapsed;

    // Reset smooth drift parameters
    this.baselineConductance = 4.5 + Math.random() * 1.0;
    this.phasicArousal = 0;
    this.baselineHR = 70 + Math.floor(Math.random() * 5);
    this.baselineHRV = 46 + Math.floor(Math.random() * 6);

    // Immediate sample
    this.emitReading();

    // 1-second continuous sampling interval
    this.timerId = setInterval(() => {
      this.elapsedSeconds += 1;
      this.emitReading();
    }, 1000);
  }

  public stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  private emitReading(): void {
    // 1. Conductance (µS): tonic drift + sympathetic arousal response
    const drift = (Math.random() - 0.5) * 0.15;
    this.baselineConductance = Math.max(3.2, Math.min(9.5, this.baselineConductance + drift));

    // Phasic response peak
    if (Math.random() < 0.15 && this.phasicArousal < 1.0) {
      this.phasicArousal += 1.8 + Math.random() * 2.2;
    }
    this.phasicArousal *= 0.88;
    if (this.phasicArousal < 0.05) this.phasicArousal = 0;

    const microNoiseG = (Math.random() - 0.5) * 0.1;
    const conductance = parseFloat(Math.max(2.5, Math.min(18.0, this.baselineConductance + this.phasicArousal + microNoiseG)).toFixed(1));

    // 2. Resistance (kΩ): R = 1000 / G (approx. formula)
    const resistance = Math.round(1000 / conductance);

    // 3. Heart Rate (BPM): fluctuates around 70-76 BPM with natural breathing cycle
    const hrJitter = (Math.random() - 0.5) * 2;
    // When arousal spikes, HR slightly rises by 2-5 bpm
    const hrArousal = this.phasicArousal > 0.5 ? Math.round(this.phasicArousal * 2) : 0;
    const heartRate = Math.round(this.baselineHR + hrArousal + hrJitter);

    // 4. HRV (ms): inversely correlated with high stress / arousal
    const hrvDrop = this.phasicArousal > 0.5 ? Math.round(this.phasicArousal * 3) : 0;
    const hrvJitter = (Math.random() - 0.5) * 3;
    const hrv = Math.max(28, Math.min(75, Math.round(this.baselineHRV - hrvDrop + hrvJitter)));

    const reading: VitalsReading = {
      timestamp: Date.now(),
      sessionElapsedSeconds: this.elapsedSeconds,
      sessionId: this.sessionId,
      conductance,
      resistance,
      heartRate,
      hrv,
      value: Math.round(conductance * 200), // backward compatibility
    };

    this.listeners.forEach((listener) => {
      try {
        listener(reading);
      } catch (err) {
        console.error('Error in DemoGSRService listener:', err);
      }
    });
  }
}
