import mongoose from 'mongoose';
import Report from '../models/report.model';
import sessionService from './session.service';
import Session from '../models/session.model';
import reportGenerator from './gemini/reportGenerator';
import { AppError } from '../middleware/error.middleware';

export class ReportService {
  /**
   * Generate an intake report for a completed patient session
   */
  async generateReport(userId: string, sessionId: string) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const error: AppError = new Error('Invalid session ID format.');
      error.statusCode = 400;
      throw error;
    }

    // Verify session ownership
    const session = await sessionService.getSessionById(userId, sessionId);

    // Completed session requirement check
    if (session.status !== 'completed') {
      const error: AppError = new Error('Report can only be generated for completed sessions.');
      error.statusCode = 400;
      throw error;
    }

    // Generate structured report content via Gemini / Mock engine
    const reportData = await reportGenerator.generateReportPayload(
      session.language || 'English',
      session.transcript || []
    );

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

    // Upsert Report document
    let report = await Report.findOne({ userId: userObjectId, sessionId: sessionObjectId });

    if (report) {
      report.summary = reportData.summary;
      report.keyThemes = reportData.keyThemes;
      report.concerns = reportData.concerns;
      report.emotionalContext = reportData.emotionalContext;
      report.importantStatements = reportData.importantStatements;
      report.conversationOverview = reportData.conversationOverview;
      report.generatedAt = new Date();
      await report.save();
    } else {
      report = await Report.create({
        userId: userObjectId,
        sessionId: sessionObjectId,
        ...reportData,
        generatedAt: new Date()
      });
    }

    // Link report ID to Session
    await Session.findByIdAndUpdate(sessionObjectId, { reportId: report._id });

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

    return report.toJSON();
  }
}

export default new ReportService();
