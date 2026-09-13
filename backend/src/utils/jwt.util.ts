import jwt from 'jsonwebtoken';
import env from '../config/env';
import { IJWTPayload } from '../types';

export const generateToken = (user: { _id?: any; id?: any; email: string }): string => {
  const payload: IJWTPayload = {
    id: (user._id || user.id).toString(),
    email: user.email
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

export const verifyToken = (token: string): IJWTPayload => {
  return jwt.verify(token, env.JWT_SECRET) as IJWTPayload;
};
