import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(6, 'Password must be at least 6 characters')
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
    bio: z.string().optional()
  }).optional()
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google idToken or credential is required').optional(),
  credential: z.string().min(1, 'Google idToken or credential is required').optional()
}).refine((data) => data.idToken || data.credential, {
  message: 'Either idToken or credential must be provided',
  path: ['idToken']
});
