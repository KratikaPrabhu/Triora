import { Request, Response, CookieOptions } from 'express';
import authService from '../services/auth.service';
import asyncWrapper from '../utils/asyncWrapper';
import env from '../config/env';

export const getAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
});

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, getAuthCookieOptions());
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie('token', {
    ...getAuthCookieOptions(),
    maxAge: 0
  });
};

export const signup = asyncWrapper(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  if (result.token) {
    setAuthCookie(res, result.token);
  }
  res.status(201).json({
    success: true,
    data: result
  });
});

export const login = asyncWrapper(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  if (result.token) {
    setAuthCookie(res, result.token);
  }
  res.status(200).json({
    success: true,
    data: result
  });
});

export const googleAuth = asyncWrapper(async (req: Request, res: Response) => {
  const result = await authService.googleLogin(req.body);
  if (result.token) {
    setAuthCookie(res, result.token);
  }
  res.status(200).json({
    success: true,
    data: result
  });
});

export const logout = asyncWrapper(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export const getMe = asyncWrapper(async (req: Request, res: Response) => {
  const user = await authService.getUserProfile(req.user!._id.toString());
  res.status(200).json({
    success: true,
    data: { user }
  });
});

export const updateProfile = asyncWrapper(async (req: Request, res: Response) => {
  const user = await authService.updateUserProfile(req.user!._id.toString(), req.body);
  res.status(200).json({
    success: true,
    data: { user }
  });
});

export const deleteAccount = asyncWrapper(async (req: Request, res: Response) => {
  const result = await authService.deleteAccount(req.user!._id.toString());
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    data: result
  });
});
