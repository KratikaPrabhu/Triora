import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/triora_db'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required').default('development_secret_key_triora_auth_2026'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  AZURE_SPEECH_KEY: z.string().optional().default(''),
  AZURE_SPEECH_REGION: z.string().optional().default(''),
  AZURE_SPEECH_VOICE: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  MOCK_MODE: z.string().transform((val) => val === 'true').default('true'),
  CLIENT_URL: z.string().default('http://localhost:3000')
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables schema:', result.error.format());
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment variable validation failed in production mode.');
    }
  }

  return result.success ? result.data : (envSchema.parse({})) as EnvConfig;
}

export const env = validateEnv();
export default env;
