import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const resp = await api.get('/notifications');
    return resp.data;
  },

  markAsRead: async (notifId) => {
    const resp = await api.put(`/notifications/${notifId}/read`);
    return resp.data;
  },

  markAllAsRead: async () => {
    const resp = await api.put('/notifications/read-all');
    return resp.data;
  }
};
