import type { User } from './user';

export interface AuthResponse {
  token: string;
  user: User;
  isNewUser?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
