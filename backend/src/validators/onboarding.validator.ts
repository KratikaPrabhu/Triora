import { z } from 'zod';

export const onboardingSchema = z.object({
  currentStep: z.number().int().min(1).max(3).optional(),
  // Step 1: Basic Information
  preferredName: z.string().min(1).max(100).optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date of birth format'
  }).optional(),
  preferredLanguage: z.string().min(2).max(10).optional(),
  
  // Step 2: Background
  backgroundInfo: z.string().max(2000).optional(),
  previousTherapyExperience: z.enum(['none', 'some', 'extensive', 'prefer_not_to_say', '']).optional(),
  primaryGoals: z.array(z.string()).optional(),

  // Step 3: Preferences & Consents
  communicationPreference: z.enum(['voice', 'text', 'both', '']).optional(),
  consentAcknowledged: z.boolean().optional(),
  termsAccepted: z.boolean().optional()
});
