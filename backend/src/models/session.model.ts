import mongoose, { Schema, Model } from 'mongoose';
import { ISessionDocument, SessionStatus } from '../types';

const ALLOWED_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  created: ['active', 'failed'],
  active: ['completed', 'failed'],
  completed: [],
  failed: []
};

export function isValidStatusTransition(currentStatus: SessionStatus, newStatus: SessionStatus): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

const sessionMessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    text: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['answered', 'silent', 'skipped', 'recognition_error', 'cancelled'],
      default: 'answered'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const sessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['created', 'active', 'completed', 'failed'],
      default: 'created',
      index: true
    },
    language: {
      type: String,
      default: 'en'
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    transcript: {
      type: [sessionMessageSchema],
      default: []
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index for querying user sessions sorted by creation time
sessionSchema.index({ userId: 1, createdAt: -1 });

export const Session: Model<ISessionDocument> = mongoose.model<ISessionDocument>('Session', sessionSchema);
export default Session;
