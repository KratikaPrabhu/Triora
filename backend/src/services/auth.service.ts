import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { generateToken } from '../utils/jwt.util';
import { AppError } from '../middleware/error.middleware';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleLoginInput {
  credential?: string;
  idToken?: string;
}

export class AuthService {
  async signup({ name, email, password }: SignupInput) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error: AppError = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      authProvider: 'local'
    });

    const token = generateToken(user);

    return {
      token,
      user: user.toJSON()
    };
  }

  async login({ email, password }: LoginInput) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error: AppError = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error: AppError = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user);

    return {
      token,
      user: user.toJSON()
    };
  }

  async getUserProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      const error: AppError = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return user.toJSON();
  }

  async updateUserProfile(userId: string, updateData: any) {
    const user = await User.findById(userId);
    if (!user) {
      const error: AppError = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.name) {
      user.name = updateData.name.trim();
    }

    if (updateData.profile) {
      user.profile = {
        ...user.profile,
        ...updateData.profile
      };
    }

    await user.save();
    return user.toJSON();
  }

  async googleLogin({ credential, idToken }: GoogleLoginInput) {
    const { verifyGoogleToken } = require('../utils/googleAuth.util');
    const token = credential || idToken;

    if (!token) {
      const error: AppError = new Error('Google token is required.');
      error.statusCode = 400;
      throw error;
    }

    const googlePayload = await verifyGoogleToken(token);
    const { sub: googleId, email, name } = googlePayload;

    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.name && name) {
        user.name = name;
      }
      await user.save();
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        authProvider: 'google'
      });
    }

    const jwtToken = generateToken(user);

    return {
      token: jwtToken,
      user: user.toJSON()
    };
  }
}

export default new AuthService();
