import mongoose, { Schema, Model } from 'mongoose';
import { IReportDocument } from '../types';
import { encryptText, decryptText } from '../utils/crypto.util';

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
      trim: true,
      set: encryptText,
      get: decryptText
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
      trim: true,
      set: encryptText,
      get: decryptText
    },
    importantStatements: {
      type: [String],
      default: []
    },
    conversationOverview: {
      type: String,
      default: '',
      trim: true,
      set: encryptText,
      get: decryptText
    },
    voiceAnalysis: {
      type: Schema.Types.Mixed,
      default: null
    },
    duration: {
      type: Number,
      default: 0
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    modelName: {
      type: String,
      default: 'gemini-3.5-flash'
    },
    version: {
      type: String,
      default: '1.0'
    }
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      transform: function (_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      getters: true
    }
  }
);

reportSchema.index({ userId: 1, sessionId: 1 });

export const Report: Model<IReportDocument> = mongoose.model<IReportDocument>('Report', reportSchema);
export default Report;
