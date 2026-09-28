import { apiRequest } from './api';
import type { Session, ApiResponse } from '../types';

export const sessionService = {
  async createSession(language = 'en', metadata = {}): Promise<ApiResponse<Session>> {
    return apiRequest<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ language, metadata }),
    });
  },

  async getSessions(): Promise<ApiResponse<{ sessions: Session[] }>> {
    return apiRequest<{ sessions: Session[] }>('/sessions');
  },

  async getSessionById(id: string): Promise<ApiResponse<{ session: Session }>> {
    return apiRequest<{ session: Session }>(`/sessions/${id}`);
  },

  async updateSession(id: string, updates: { status?: string; metadata?: any }): Promise<ApiResponse<{ session: Session }>> {
    return apiRequest<{ session: Session }>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async respondToSession(
    id: string,
    payload: { text?: string; status?: string; voiceMetrics?: any }
  ): Promise<ApiResponse<{ action: string; question: string; reason?: string; metadata?: any; session: Session }>> {
    return apiRequest<{ action: string; question: string; reason?: string; metadata?: any; session: Session }>(
      `/sessions/${id}/respond`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async getHeatmap(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/sessions/${id}/heatmap`);
  },
};
