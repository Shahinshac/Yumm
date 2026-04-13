import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google-login', { id_token: idToken });
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

  uploadIdentityProof: async (formData) => {
    const response = await api.post('/uploads/identity-proof', formData);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  testCustomerLogin: async () => {
    const response = await api.post('/auth/test-customer-login', { email: 'testcust@yumm.com' });
    return response.data;
  }
};
