import api from './api';
import type { AuthResponse, User, UserProfile } from '../types';

export const authService = {
  async signup(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/api/auth/signup', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/api/auth/login', data);
    return res.data.data;
  },

  async googleAuth(credential: string): Promise<AuthResponse> {
    const res = await api.post('/api/auth/google', { credential });
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get('/api/auth/me');
    return res.data.data.user || res.data.data;
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<User> {
    const res = await api.patch('/api/auth/profile', profileData);
    return res.data.data;
  },
};

export default authService;
