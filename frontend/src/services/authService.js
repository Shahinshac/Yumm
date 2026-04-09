import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  googleLogin: async (accessToken) => {
    const response = await api.post('/auth/google-login', { access_token: accessToken });
    return response.data;
  },

  registerRestaurant: async (data) => {
    const response = await api.post('/auth/register/restaurant', data);
    return response.data;
  },

  registerDelivery: async (data) => {
    const response = await api.post('/auth/register/delivery', data);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }
};
