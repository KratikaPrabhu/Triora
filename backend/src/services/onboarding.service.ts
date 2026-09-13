import User from '../models/user.model';
import { IUserProfile } from '../types';
import { AppError } from '../middleware/error.middleware';

export class OnboardingService {
  calculateCompletion(profile: Partial<IUserProfile>): boolean {
    const hasName = Boolean(profile.preferredName && profile.preferredName.trim().length > 0);
    const hasConsent = Boolean(profile.consentAcknowledged === true);
    const hasTerms = Boolean(profile.termsAccepted === true);

    return hasName && hasConsent && hasTerms;
  }

  async getOnboarding(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      const error: AppError = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const userJson = user.toJSON();
    return {
      profile: userJson.profile,
      isOnboardingComplete: user.profile.isOnboardingComplete,
      currentStep: user.profile.currentStep
    };
  }

  async updateOnboarding(userId: string, updateData: Partial<IUserProfile>) {
    const user = await User.findById(userId);
    if (!user) {
      const error: AppError = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const allowedKeys: (keyof IUserProfile)[] = [
      'preferredName',
      'dateOfBirth',
      'preferredLanguage',
      'backgroundInfo',
      'previousTherapyExperience',
      'primaryGoals',
      'communicationPreference',
      'consentAcknowledged',
      'termsAccepted',
      'currentStep'
    ];

    allowedKeys.forEach((key) => {
      if (updateData[key] !== undefined) {
        if (key === 'dateOfBirth' && updateData[key]) {
          user.profile[key] = new Date(updateData[key] as any);
        } else {
          (user.profile as any)[key] = updateData[key];
        }
      }
    });

    user.profile.isOnboardingComplete = this.calculateCompletion(user.profile);

    await user.save();

    const userJson = user.toJSON();
    return {
      profile: userJson.profile,
      isOnboardingComplete: user.profile.isOnboardingComplete,
      currentStep: user.profile.currentStep
    };
  }
}

export default new OnboardingService();
