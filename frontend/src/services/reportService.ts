import { apiRequest } from './api';
import type { Report, ApiResponse } from '../types';

export const reportService = {
  async generateReport(sessionId: string, payload?: { durationSeconds?: number }): Promise<ApiResponse<{ report: Report }>> {
    return apiRequest<{ report: Report }>(`/report/generate/${sessionId}`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  async getReport(id: string): Promise<ApiResponse<{ report: Report }>> {
    return apiRequest<{ report: Report }>(`/report/${id}`);
  },
};
