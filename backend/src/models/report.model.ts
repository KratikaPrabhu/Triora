import mongoose, { Schema, Model } from 'mongoose';
import { IReportDocument } from '../types';

const reportSchema = new Schema<IReportDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    keyThemes: {
      type: [String],
      default: []
    },
    concerns: {
      type: [String],
      default: []
    },
    emotionalContext: {
      type: String,
      default: '',
      trim: true
    },
    importantStatements: {
      type: [String],
      default: []
    },
    conversationOverview: {
      type: String,
      default: '',
      trim: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    modelName: {
      type: String,
      default: 'gemini-2.5-flash'
    },
    version: {
      type: String,
      default: '1.0'
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

reportSchema.index({ userId: 1, sessionId: 1 });

export const Report: Model<IReportDocument> = mongoose.model<IReportDocument>('Report', reportSchema);
export default Report;
