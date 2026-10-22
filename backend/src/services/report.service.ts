import mongoose from 'mongoose';
import Report from '../models/report.model';
import sessionService from './session.service';
import Session from '../models/session.model';
import reportGenerator from './gemini/reportGenerator';
import heatmapService from './heatmap.service';
import { AppError } from '../middleware/error.middleware';

import logger from '../config/logger';

export class ReportService {
  /**
   * Generate an intake report for a completed patient session
   */
  async generateReport(userId: string, sessionId: string, clientDuration?: number) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const error: AppError = new Error('Invalid session ID format.');
      error.statusCode = 400;
      throw error;
    }

    logger.info(`[Report] Finish session requested`);
    logger.info(`[Report] Session ID: ${sessionId}`);

    // Verify session ownership
    const session = await sessionService.getSessionById(userId, sessionId);

    // Completed session requirement check
    if (session.status !== 'completed') {
      const error: AppError = new Error('Report can only be generated for completed sessions.');
      error.statusCode = 400;
      throw error;
    }

    // Determine actual session duration (in seconds)
    let actualDurationSeconds = 0;
    if (typeof clientDuration === 'number' && clientDuration > 0) {
      actualDurationSeconds = Math.round(clientDuration);
    } else if (session.duration && session.duration > 0) {
      actualDurationSeconds = session.duration;
    } else if (session.completedAt && session.startedAt) {
      actualDurationSeconds = Math.max(1, Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000));
    } else if (session.completedAt && session.createdAt) {
      actualDurationSeconds = Math.max(1, Math.round((new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime()) / 1000));
    } else if (session.transcript && session.transcript.length > 1) {
      const first = new Date(session.transcript[0].timestamp).getTime();
      const last = new Date(session.transcript[session.transcript.length - 1].timestamp).getTime();
      actualDurationSeconds = Math.max(1, Math.round((last - first) / 1000));
    } else if (session.transcript && session.transcript.length === 1 && session.completedAt) {
      const first = new Date(session.transcript[0].timestamp).getTime();
      actualDurationSeconds = Math.max(1, Math.round((new Date(session.completedAt).getTime() - first) / 1000));
    }

    const patientResponseCount = (session.transcript || []).filter(
      (m: any) => m.role === 'user' && m.text && m.text.trim()
    ).length;
    logger.info(`[Report] Patient responses: ${patientResponseCount}`);
    logger.info(`[Report] Generating Gemini report`);

    // Generate structured report content via Gemini / Mock engine
    const reportData = await reportGenerator.generateReportPayload(
      session.language || 'English',
      session.transcript || []
    );

    logger.info(`[Report] Gemini report generated`);
    logger.info(`[Report] Saving report`);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

    // Fetch voice heatmap metrics calculated from patient's actual recordings
    const heatmapData = await heatmapService.getSessionHeatmap(userId, sessionId);
    const voiceAnalysisPayload = {
      totalDuration: actualDurationSeconds > 0 ? actualDurationSeconds : heatmapData.totalDuration,
      speechDuration: heatmapData.totalDuration,
      averageFrequency: heatmapData.averageFrequency,
      minFrequency: heatmapData.minFrequency,
      maxFrequency: heatmapData.maxFrequency,
      samplesCount: heatmapData.totalSamples,
      samples: heatmapData.samples.map(s => ({ timeOffset: s.timeOffset, frequency: s.frequency })),
      responses: heatmapData.responses.map(r => ({
        responseIndex: r.responseIndex,
        questionText: r.questionText,
        responseText: r.responseText,
        duration: r.duration,
        avgFrequency: r.avgFrequency,
        minFrequency: r.minFrequency,
        maxFrequency: r.maxFrequency
      }))
    };

    // Upsert Report document
    let report = await Report.findOne({ userId: userObjectId, sessionId: sessionObjectId });

    if (report) {
      report.summary = reportData.summary;
      report.keyThemes = reportData.keyThemes;
      report.concerns = reportData.concerns;
      report.emotionalContext = reportData.emotionalContext;
      report.importantStatements = reportData.importantStatements;
      report.conversationOverview = reportData.conversationOverview;
      report.duration = actualDurationSeconds;
      report.voiceAnalysis = voiceAnalysisPayload;
      report.generatedAt = new Date();
      await report.save();
    } else {
      report = await Report.create({
        userId: userObjectId,
        sessionId: sessionObjectId,
        ...reportData,
        duration: actualDurationSeconds,
        voiceAnalysis: voiceAnalysisPayload,
        generatedAt: new Date()
      });
    }

    // Link report ID and duration to Session
    await Session.findByIdAndUpdate(sessionObjectId, {
      reportId: report._id,
      ...(actualDurationSeconds > 0 ? { duration: actualDurationSeconds } : {})
    });

    logger.info(`[Report] Report saved successfully with actual session duration: ${actualDurationSeconds}s`);
    logger.info(`[Report] Returning report ID: ${report._id}`);

    return report.toJSON();
  }

  /**
   * Retrieve report by report ID or associated session ID (strictly scoped to userId)
   */
  async getReportById(userId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: AppError = new Error('Invalid report ID format.');
      error.statusCode = 400;
      throw error;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const targetObjectId = new mongoose.Types.ObjectId(id);

    // Search by report ID or associated session ID
    const report = await Report.findOne({
      userId: userObjectId,
      $or: [{ _id: targetObjectId }, { sessionId: targetObjectId }]
    });

    if (!report) {
      const error: AppError = new Error('Report not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    // If report has no duration or totalDuration is 0, backfill from linked session
    if (!report.duration || report.duration === 0 || !report.voiceAnalysis?.totalDuration) {
      try {
        const session = await Session.findById(report.sessionId);
        if (session) {
          let computedDuration = 0;
          if (session.duration && session.duration > 0) {
            computedDuration = session.duration;
          } else if (session.completedAt && session.startedAt) {
            computedDuration = Math.max(1, Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000));
          } else if (session.completedAt && session.createdAt) {
            computedDuration = Math.max(1, Math.round((new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime()) / 1000));
          } else if (session.transcript && session.transcript.length > 1) {
            const first = new Date(session.transcript[0].timestamp).getTime();
            const last = new Date(session.transcript[session.transcript.length - 1].timestamp).getTime();
            computedDuration = Math.max(1, Math.round((last - first) / 1000));
          } else if (session.transcript && session.transcript.length === 1 && session.completedAt) {
            const first = new Date(session.transcript[0].timestamp).getTime();
            computedDuration = Math.max(1, Math.round((new Date(session.completedAt).getTime() - first) / 1000));
          }

          if (computedDuration > 0) {
            report.duration = computedDuration;
            if (!report.voiceAnalysis) {
              report.voiceAnalysis = {
                totalDuration: computedDuration,
                speechDuration: 0,
                averageFrequency: 0,
                minFrequency: 0,
                maxFrequency: 0,
                samplesCount: 0,
                samples: [],
                responses: []
              };
            } else {
              report.voiceAnalysis.totalDuration = computedDuration;
              report.markModified('voiceAnalysis');
            }
            await report.save();

            if (!session.duration || session.duration === 0) {
              session.duration = computedDuration;
              await session.save();
            }
          }
        }
      } catch (err) {
        logger.error(`[Report] Error backfilling duration: ${err}`);
      }
    }

    return report.toJSON();
  }
}

export default new ReportService();
