import api from './api';
import type { Session, SessionHeatmapResponse } from '../types';

export const sessionService = {
  async createSession(language = 'English'): Promise<Session> {
    const res = await api.post('/api/sessions', { language });
    return res.data.data?.session || res.data.data;
  },

  async getSessions(): Promise<Session[]> {
    const res = await api.get('/api/sessions');
    const data = res.data.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.sessions)) return data.sessions;
    return [];
  },

  async getSessionById(id: string): Promise<Session> {
    const res = await api.get(`/api/sessions/${id}`);
    return res.data.data?.session || res.data.data;
  },

  async updateSession(id: string, updates: { status?: string; language?: string }): Promise<Session> {
    const res = await api.patch(`/api/sessions/${id}`, updates);
    return res.data.data?.session || res.data.data;
  },

  async getHeatmap(sessionId: string): Promise<SessionHeatmapResponse> {
    try {
      const res = await api.get(`/api/sessions/${sessionId}/heatmap`);
      return res.data.data?.heatmap || res.data.data;
    } catch {
      const res = await api.get(`/api/heatmap`, { params: { sessionId } });
      return res.data.data?.heatmap || res.data.data;
    }
  },
};

export default sessionService;
