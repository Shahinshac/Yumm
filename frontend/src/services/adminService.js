import api from './api';

export const adminService = {
  getPendingUsers: async () => {
    const response = await api.get('/admin/pending-users');
    return response.data;
  },
  
  approveUser: async (userId) => {
    const response = await api.post(`/admin/approve/${userId}`);
    return response.data;
  },

  rejectUser: async (userId) => {
    const response = await api.post(`/admin/reject/${userId}`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin-dashboard/stats');
    return response.data;
  },

  getRestaurants: async () => {
    const response = await api.get('/admin/restaurants');
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  },

  getDetailedAnalytics: async (period = 'week') => {
    const response = await api.get(`/admin/analytics/orders?period=${period}`);
    return response.data;
  },

  getGlobalMapData: async () => {
    const response = await api.get('/admin/global-map-data');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users/create', userData);
    return response.data;
  }
};
