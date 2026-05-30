import api from './api';

export const onboardingService = {
  registerWorkshop: async (onboardingData) => {
    try {
      const response = await api.post('/auth/onboard', onboardingData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
