import api from './api';

export const deliveryService = {
  getStats: async () => {
    const resp = await api.get('/delivery-dashboard/stats');
    return resp.data;
  },

  getOrders: async () => {
    const resp = await api.get('/delivery-dashboard/orders');
    return resp.data;
  },

  getEarnings: async (period = 'month') => {
    const resp = await api.get(`/delivery-dashboard/earnings?period=${period}`);
    return resp.data;
  },

  getHistory: async () => {
    const resp = await api.get('/delivery-dashboard/history');
    return resp.data;
  },

  updateStatus: async (orderId, status, location = null) => {
    const resp = await api.put(`/delivery-dashboard/orders/${orderId}/status`, { status, location });
    return resp.data;
  },

  getAvailableOrders: async () => {
    const resp = await api.get('/delivery-dashboard/available');
    return resp.data;
  },

  claimOrder: async (orderId) => {
    const resp = await api.post(`/delivery-dashboard/orders/${orderId}/claim`);
    return resp.data;
  },

  toggleAvailability: async (isAvailable) => {
    const resp = await api.post('/delivery-dashboard/availability', { is_available: isAvailable });
    return resp.data;
  }
};
