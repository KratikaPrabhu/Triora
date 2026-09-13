import mongoose from 'mongoose';
import Session, { isValidStatusTransition } from '../models/session.model';
import { ISessionMessage, SessionStatus } from '../types';
import { AppError } from '../middleware/error.middleware';

export interface CreateSessionInput {
  language?: string;
  metadata?: Record<string, any>;
}

export interface UpdateSessionInput {
  status?: SessionStatus;
  language?: string;
  metadata?: Record<string, any>;
  transcript?: ISessionMessage[];
}

export class SessionService {
  /**
   * Create a new pre-therapy intake session for the authenticated user
   */
  async createSession(userId: string, data: CreateSessionInput) {
    const session = await Session.create({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'created',
      language: data.language || 'en',
      metadata: data.metadata || {},
      transcript: []
    });

    return session.toJSON();
  }

  /**
   * List all intake sessions belonging to the authenticated user
   */
  async getUserSessions(userId: string) {
    const sessions = await Session.find({
      userId: new mongoose.Types.ObjectId(userId)
    }).sort({ createdAt: -1 });

    return sessions.map((s) => s.toJSON());
  }

  /**
   * Get a specific session owned by the authenticated user
   */
  async getSessionById(userId: string, sessionId: string) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const error: AppError = new Error('Invalid session ID format.');
      error.statusCode = 400;
      throw error;
    }

    const session = await Session.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!session) {
      const error: AppError = new Error('Session not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    return session.toJSON();
  }

  /**
   * Update session status, metadata, or transcript with strict user-scoping and transition validation
   */
  async updateSession(userId: string, sessionId: string, updateData: UpdateSessionInput) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const error: AppError = new Error('Invalid session ID format.');
      error.statusCode = 400;
      throw error;
    }

    const session = await Session.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!session) {
      const error: AppError = new Error('Session not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    // Validate status transition if status change requested
    if (updateData.status && updateData.status !== session.status) {
      const isValid = isValidStatusTransition(session.status, updateData.status);
      if (!isValid) {
        const error: AppError = new Error(
          `Invalid status transition from '${session.status}' to '${updateData.status}'.`
        );
        error.statusCode = 400;
        throw error;
      }

      session.status = updateData.status;

      if (updateData.status === 'active' && !session.startedAt) {
        session.startedAt = new Date();
      } else if (updateData.status === 'completed' || updateData.status === 'failed') {
        session.completedAt = new Date();
      }
    }

    if (updateData.language) {
      session.language = updateData.language;
    }

    if (updateData.metadata) {
      session.metadata = {
        ...(session.metadata || {}),
        ...updateData.metadata
      };
    }

    if (updateData.transcript && Array.isArray(updateData.transcript)) {
      const formattedMessages = updateData.transcript.map((msg) => ({
        role: msg.role,
        text: msg.text,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      }));
      session.transcript.push(...(formattedMessages as any));
    }

    await session.save();
    return session.toJSON();
  }
}

export default new SessionService();
