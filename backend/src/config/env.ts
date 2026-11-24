import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z
  .object({
    PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/triora_db'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required').default('development_secret_key_triora_auth_2026'),
    ENCRYPTION_KEY: z.string().optional().default(''),
    GOOGLE_CLIENT_ID: z.string().optional().default(''),
    AZURE_SPEECH_KEY: z.string().optional().default(''),
    AZURE_SPEECH_REGION: z.string().optional().default(''),
    AZURE_SPEECH_VOICE: z.string().optional().default(''),
    GEMINI_API_KEY: z.string().optional().default(''),
    GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
    MOCK_MODE: z.string().transform((val) => val === 'true').default('true'),
    CLIENT_URL: z.string().default('http://localhost:3000')
  })
  .superRefine((data, ctx) => {
    // In production, strictly enforce that JWT_SECRET is explicitly provided and not the development fallback
    if (data.NODE_ENV === 'production') {
      const devDefaultSecret = 'development_secret_key_triora_auth_2026';
      const rawSecret = process.env.JWT_SECRET;

      if (!rawSecret || rawSecret.trim() === '' || rawSecret === devDefaultSecret) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message: 'CRITICAL SECURITY: In production, JWT_SECRET must be explicitly set to a custom strong secret and cannot use the development fallback key.'
        });
      }
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => ` - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');

    console.error('Environment variables validation failed:\n' + errorDetails);

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`CRITICAL: Server startup aborted due to invalid production configuration:\n${errorDetails}`);
    }
  }

  return result.success ? result.data : (envSchema.parse({})) as EnvConfig;
}

export const env = validateEnv();
export default env;
