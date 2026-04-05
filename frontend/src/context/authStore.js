import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: async (credentials) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      set({ user: data.user, isAuthenticated: true, loading: false });
      return { success: true, role: data.user.role };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Login failed' };
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const { data } = await authAPI.getMe();
      set({ user: data, isAuthenticated: true });
    } catch {
      localStorage.clear();
      set({ isAuthenticated: false, user: null });
    }
  },
}));
