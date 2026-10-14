import { apiRequest, setStoredToken, removeStoredToken } from './api';
import type { AuthResponse, ApiResponse } from '../types/auth';
import type { User } from '../types/user';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  emergencyContact?: string;
  previousTherapyExperience?: string;
  underProfessionalCare?: string;
  howDidYouHearAboutUs?: string;
}

export const authService = {
  async signup(data: SignupData | string, maybeEmail?: string, maybePassword?: string): Promise<ApiResponse<AuthResponse>> {
    let payload: any;
    if (typeof data === 'string') {
      payload = { name: data, email: maybeEmail, password: maybePassword };
    } else {
      payload = data;
    }
    const res = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data?.token) {
      setStoredToken(res.data.token);
    }
    return res;
  },

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data?.token) {
      setStoredToken(res.data.token);
    }
    return res;
  },

  async googleAuth(credential: string): Promise<ApiResponse<AuthResponse>> {
    const res = await apiRequest<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });

    if (res.success && res.data?.token) {
      setStoredToken(res.data.token);
    }
    return res;
  },

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return apiRequest<{ user: User }>('/auth/me');
  },

  async updateProfile(profileData: any): Promise<ApiResponse<{ user: User }>> {
    return apiRequest<{ user: User }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  async updateOnboarding(profileData: any): Promise<ApiResponse<any>> {
    return apiRequest<any>('/onboarding', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  async getOnboarding(): Promise<ApiResponse<any>> {
    return apiRequest<any>('/onboarding');
  },

  logout(): void {
    removeStoredToken();
  },
};
