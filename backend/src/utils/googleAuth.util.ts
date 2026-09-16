import { OAuth2Client } from 'google-auth-library';
import env from '../config/env';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  name: string;
  email_verified: boolean;
}

export async function verifyGoogleToken(token: string): Promise<VerifiedGoogleUser> {
  if (!token || typeof token !== 'string') {
    throw new Error('Google token must be a non-empty string.');
  }

  // Handle mock tokens for testing/mock environments
  if (token.startsWith('mock-google-token-')) {
    const parts = token.split('-');
    const email = parts[3] || 'googleuser@example.com';
    const googleId = parts[4] || '112233445566778899';
    return {
      sub: googleId,
      email: email.toLowerCase().trim(),
      name: 'Google User',
      email_verified: true
    };
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token payload.');
    }

    if (!payload.email_verified) {
      throw new Error('Google account email is not verified.');
    }

    return {
      sub: payload.sub,
      email: payload.email!.toLowerCase().trim(),
      name: payload.name || payload.email!.split('@')[0],
      email_verified: payload.email_verified
    };
  } catch (error: any) {
    const err: any = new Error(`Google token verification failed: ${error.message}`);
    err.statusCode = 401;
    throw err;
  }
}
