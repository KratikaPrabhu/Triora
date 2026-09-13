import api from './api';
import type { OnboardingData, OnboardingResponse } from '../types';

export const onboardingService = {
  async getOnboarding(): Promise<OnboardingResponse> {
    const res = await api.get('/api/onboarding');
    return res.data.data;
  },

  async updateOnboarding(data: OnboardingData & { step?: number }): Promise<OnboardingResponse> {
    const res = await api.patch('/api/onboarding', data);
    return res.data.data;
  },
};

export default onboardingService;
