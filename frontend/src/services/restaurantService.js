import api from './api';

export const restaurantService = {
  // Get restaurant profile
  getProfile: async () => {
    const resp = await api.get('/restaurant-dashboard/profile');
    return resp.data;
  },

  // Menu Management
  getMenu: async () => {
    const resp = await api.get('/restaurant-dashboard/menu');
    return resp.data;
  },

  addMenuItem: async (itemData) => {
    const resp = await api.post('/restaurant-dashboard/menu/add', itemData);
    return resp.data;
  },

  updateMenuItem: async (id, itemData) => {
    const resp = await api.put(`/restaurant-dashboard/menu/${id}/update`, itemData);
    return resp.data;
  },

  deleteMenuItem: async (id) => {
    const resp = await api.delete(`/restaurant-dashboard/menu/${id}/delete`);
    return resp.data;
  },

  // Order Management
  getOrders: async (status = '') => {
    const url = status ? `/restaurant-dashboard/orders?status=${status}` : '/restaurant-dashboard/orders';
    const resp = await api.get(url);
    return resp.data.orders || [];
  },

  acceptOrder: async (id) => {
    const resp = await api.post(`/restaurant-dashboard/orders/${id}/accept`);
    return resp.data;
  },

  rejectOrder: async (id, reason = '') => {
    const resp = await api.post(`/restaurant-dashboard/orders/${id}/reject`, { reason });
    return resp.data;
  },

  updateOrderStatus: async (id, status) => {
    const resp = await api.put(`/restaurant-dashboard/orders/${id}/status`, { status });
    return resp.data;
  },

  getAnalytics: async (period = 'month') => {
    const resp = await api.get(`/restaurant-dashboard/analytics?period=${period}`);
    return resp.data;
  },

  getReviews: async () => {
    const resp = await api.get('/restaurant-dashboard/reviews');
    return resp.data;
  },

  updateProfile: async (profileData) => {
    const resp = await api.put('/restaurant-dashboard/profile/update', profileData);
    return resp.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return resp.data;
  },

  updateUpiId: async (upiId) => {
    const resp = await api.put('/restaurant-dashboard/profile/update', { upi_id: upiId });
    return resp.data;
  },

  verifyPayment: async (orderId) => {
    const resp = await api.post(`/restaurant-dashboard/orders/${orderId}/verify-payment`);
    return resp.data;
  },

  createRazorpayOrder: async (amount) => {
    const resp = await api.post('/restaurant-dashboard/razorpay/create-order', { amount });
    return resp.data;
  }
};
