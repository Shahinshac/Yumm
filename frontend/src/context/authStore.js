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
    set({ loading: true, error: null });
    try {
      const { data: response } = await authAPI.register(data);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      set({ user: response.user, isAuthenticated: true, loading: false });
      return {
        success: true,
        message: 'Registration successful!'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
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
      // Only logout on 401/403 (invalid token)
      // On other errors (network, server error), keep user logged in
      if (error.response?.status === 401 || error.response?.status === 403) {
        set({ isAuthenticated: false, user: null });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      // Silently pass on other errors - user stays logged in
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

  setMPIN: async (mpin) => {
    try {
      const response = await authAPI.setMPIN(mpin);
      return {
        success: true,
        message: response.data?.message || 'MPIN set successfully'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to set MPIN';
      set({ error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  verifyMPIN: async (mpin) => {
    try {
      const response = await authAPI.verifyMPIN(mpin);
      return {
        success: true,
        verified: response.data?.verified || true,
        message: response.data?.message || 'MPIN verified'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'MPIN verification failed';
      return { success: false, message: errorMessage };
    }
  },
}));
