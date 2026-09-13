import { Request, Response } from 'express';
import authService from '../services/auth.service';
import asyncWrapper from '../utils/asyncWrapper';

export const signup = asyncWrapper(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  res.status(201).json({
    success: true,
    data: result
  });
});

export const login = asyncWrapper(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.status(200).json({
    success: true,
    data: result
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

export const googleAuth = asyncWrapper(async (req: Request, res: Response) => {
  const result = await authService.googleLogin(req.body);
  res.status(200).json({
    success: true,
    data: result
  });
});
