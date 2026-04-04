/**
 * Auth Store - Centralized auth state management with Zustand
 */
import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  register: async (data) => {
    // Registration is disabled - only admin/staff can create customer accounts
    return {
      success: false,
      message: 'Public registration is disabled. Please contact your administrator to create an account.'
    };
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      set({ user: data.user, isAuthenticated: true, loading: false });
      return {
        success: true,
        message: 'Login successful!',
        is_first_login: data.user?.is_first_login || false,
        role: data.user?.role || 'customer'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const { data } = await authAPI.getMe();
      set({ user: data, isAuthenticated: true });
    } catch (error) {
      set({ isAuthenticated: false, user: null });
      localStorage.removeItem('access_token');
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      await authAPI.changePassword({ old_password: oldPassword, new_password: newPassword });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Change password failed' });
      return { success: false };
    }
  },
}));
