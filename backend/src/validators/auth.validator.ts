import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z)')
    .regex(/[0-9]/, 'Password must contain at least one number (0-9)')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)'),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  previousTherapy: z.string().optional(),
  previousTherapyExperience: z.enum(['none', 'some', 'extensive', 'prefer_not_to_say', '']).optional(),
  underProfessionalCare: z.string().optional(),
  howDidYouHearAboutUs: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  profile: z.object({
    phone: z.string().optional(),
    preferredLanguage: z.string().optional(),
    age: z.number().optional(),
    emergencyContact: z.string().optional(),
    bio: z.string().optional(),
    preferredName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    backgroundInfo: z.string().optional(),
    previousTherapy: z.string().optional(),
    previousTherapyExperience: z.enum(['none', 'some', 'extensive', 'prefer_not_to_say', '']).optional(),
    underProfessionalCare: z.string().optional(),
    howDidYouHearAboutUs: z.string().optional()
  }).optional()
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google idToken or credential is required').optional(),
  credential: z.string().min(1, 'Google idToken or credential is required').optional()
}).refine((data) => data.idToken || data.credential, {
  message: 'Either idToken or credential must be provided',
  path: ['idToken']
});
