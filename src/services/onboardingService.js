import api from './api';

export const onboardingService = {
  sendOtp: async (phone) => {
    try {
      const response = await api.post('/auth/send-otp', { phone });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  registerWithOtp: async (onboardingData) => {
    try {
      const response = await api.post('/auth/register-with-otp', onboardingData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
