export interface UserProfile {
  phone?: string;
  preferredLanguage?: string;
  age?: number | null;
  emergencyContact?: string;
  bio?: string;
  preferredName?: string;
  dateOfBirth?: string | null;
  backgroundInfo?: string;
  previousTherapyExperience?: 'none' | 'some' | 'extensive' | 'prefer_not_to_say' | '';
  primaryGoals?: string[];
  communicationPreference?: 'voice' | 'text' | 'both' | '';
  consentAcknowledged?: boolean;
  termsAccepted?: boolean;
  currentStep?: number;
  isOnboardingComplete?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  authProvider: 'local' | 'google';
  googleId?: string | null;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}
