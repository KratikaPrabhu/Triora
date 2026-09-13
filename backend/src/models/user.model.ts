import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from '../types';

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: function (this: IUserDocument) {
        return this.authProvider === 'local';
      }
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      default: null
    },
    profile: {
      phone: { type: String, default: '' },
      preferredLanguage: { type: String, default: 'en' },
      age: { type: Number, default: null },
      emergencyContact: { type: String, default: '' },
      bio: { type: String, default: '' },
      // Step 1: Basic Information
      preferredName: { type: String, default: '' },
      dateOfBirth: { type: Date, default: null },
      // Step 2: Background
      backgroundInfo: { type: String, default: '' },
      previousTherapyExperience: {
        type: String,
        enum: ['none', 'some', 'extensive', 'prefer_not_to_say', ''],
        default: ''
      },
      primaryGoals: { type: [String], default: [] },
      // Step 3: Preferences & Consents
      communicationPreference: {
        type: String,
        enum: ['voice', 'text', 'both', ''],
        default: ''
      },
      consentAcknowledged: { type: Boolean, default: false },
      termsAccepted: { type: Boolean, default: false },
      // Onboarding Status Tracking
      currentStep: { type: Number, default: 1, min: 1, max: 3 },
      isOnboardingComplete: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: Record<string, any>) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
export default User;
