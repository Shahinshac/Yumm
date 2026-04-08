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
  }
};
