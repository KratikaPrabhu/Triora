import mongoose from 'mongoose';
import sessionService from './session.service';
import { AppError } from '../middleware/error.middleware';

export interface HeatmapHistoryPoint {
  timestamp: string;
  conductance: number; // in µS (microsiemens, e.g. 5.0 - 20.0)
  resistance: number;  // in kΩ (kiloohms, e.g. 50 - 200)
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
  conductance: number; // Current reading in µS
  resistance: number;  // Current reading in kΩ
  timestamp: string;
  history: HeatmapHistoryPoint[];
  timeline: HeatmapDataPoint[];
}

export class HeatmapService {
  /**
   * Generates or retrieves simulated heat-map & GSR data for a session
   */
  async getSessionHeatmap(userId: string, sessionId: string): Promise<SessionHeatmapResponse> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const error: AppError = new Error('Invalid session ID format.');
      error.statusCode = 400;
      throw error;
    }

    // Verify session ownership
    const session = await sessionService.getSessionById(userId, sessionId);

    const transcript = session.transcript || [];
    const timeline: HeatmapDataPoint[] = [];
    const history: HeatmapHistoryPoint[] = [];

    let totalIntensity = 0;
    let peakIntensity = -1;
    let peakTimestamp: string | null = null;

    const baseTime = session.startedAt || session.createdAt || new Date();

    if (transcript.length === 0) {
      // Mock generated points if transcript is empty (for created sessions)
      for (let i = 0; i < 6; i++) {
        const pointTime = new Date(new Date(baseTime).getTime() + i * 45000).toISOString();
        const intensity = parseFloat((0.25 + (i * 0.12) % 0.5).toFixed(2));
        timeline.push({
          timestamp: pointTime,
          intensity,
          emotion: i % 2 === 0 ? 'calm' : 'reflective',
          topic: 'general_intake'
        });

        const cond = parseFloat((8.0 + intensity * 6.0).toFixed(1));
        const resis = parseFloat((1000 / cond).toFixed(1));
        history.push({
          timestamp: pointTime,
          conductance: cond,
          resistance: resis
        });

        totalIntensity += intensity;
        if (intensity > peakIntensity) {
          peakIntensity = intensity;
          peakTimestamp = pointTime;
        }
      }
    } else {
      const emotions = ['anxious', 'hopeful', 'overwhelmed', 'reflective', 'calm', 'distressed'];
      const topics = ['work_stress', 'sleep', 'relationships', 'emotional_wellbeing', 'coping_mechanisms'];

      transcript.forEach((msg, idx) => {
        const textLen = msg.text ? msg.text.length : 0;
        let intensity = msg.role === 'user' ? Math.min(0.95, 0.3 + (textLen % 50) / 100) : 0.25;
        intensity = parseFloat(intensity.toFixed(2));

        const emotion = emotions[idx % emotions.length];
        const topic = topics[idx % topics.length];
        const timestampStr = msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString();

        timeline.push({
          timestamp: timestampStr,
          intensity,
          emotion,
          topic
        });

        const cond = parseFloat((7.5 + intensity * 7.5).toFixed(1));
        const resis = parseFloat((1000 / cond).toFixed(1));
        history.push({
          timestamp: timestampStr,
          conductance: cond,
          resistance: resis
        });

        totalIntensity += intensity;
        if (intensity > peakIntensity) {
          peakIntensity = intensity;
          peakTimestamp = timestampStr;
        }
      });
    }

    const avgIntensity = timeline.length > 0 ? parseFloat((totalIntensity / timeline.length).toFixed(2)) : 0.4;
    const latestHistory = history[history.length - 1] || {
      timestamp: new Date().toISOString(),
      conductance: 10.5,
      resistance: 95.2
    };

    return {
      sessionId: session._id.toString(),
      userId: session.userId.toString(),
      totalPoints: timeline.length,
      averageIntensity: avgIntensity,
      peakIntensityTimestamp: peakTimestamp,
      conductance: latestHistory.conductance,
      resistance: latestHistory.resistance,
      timestamp: latestHistory.timestamp,
      history,
      timeline
    };
  }
}

export default new HeatmapService();
