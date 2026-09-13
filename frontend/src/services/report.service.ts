import api from './api';
import type { Report } from '../types';

export const reportService = {
  async generateReport(sessionId: string): Promise<Report> {
    const res = await api.post(`/api/report/generate/${sessionId}`);
    return res.data.data?.report || res.data.data;
  },

  async getReport(idOrSessionId: string): Promise<Report> {
    const res = await api.get(`/api/report/${idOrSessionId}`);
    return res.data.data?.report || res.data.data;
  },
};

export default reportService;
