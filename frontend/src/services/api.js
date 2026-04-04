/**
 * API Service - Centralized API calls
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (credentials) => api.post('/auth/login', credentials),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Account endpoints
export const accountAPI = {
  create: (data) => api.post('/accounts', data),
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  getBalance: (id) => api.get(`/accounts/${id}/balance`),
};

// Transaction endpoints
export const transactionAPI = {
  deposit: (data) => api.post('/transactions/deposit', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  transfer: (data) => api.post('/transactions/transfer', data),
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
};

// Beneficiary endpoints
export const beneficiaryAPI = {
  add: (data) => api.post('/beneficiaries', data),
  getAll: (params) => api.get('/beneficiaries', { params }),
  approve: (id, data) => api.post(`/beneficiaries/${id}/approve`, data),
  delete: (id) => api.delete(`/beneficiaries/${id}`),
};

// Card endpoints
export const cardAPI = {
  generate: (data) => api.post('/cards', data),
  getAll: (params) => api.get('/cards', { params }),
  setPin: (id, data) => api.post(`/cards/${id}/set-pin`, data),
};

// Loan endpoints
export const loanAPI = {
  apply: (data) => api.post('/loans', data),
  getAll: () => api.get('/loans'),
  getById: (id) => api.get(`/loans/${id}`),
  approve: (id) => api.post(`/loans/${id}/approve`),
};

// Scheduled payment endpoints
export const scheduledPaymentAPI = {
  schedule: (data) => api.post('/scheduled-payments', data),
  getAll: (params) => api.get('/scheduled-payments', { params }),
  cancel: (id) => api.post(`/scheduled-payments/${id}/cancel`),
};

// Notification endpoints
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
};

// Analytics endpoints
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUsers: () => api.get('/analytics/users'),
  getAccounts: () => api.get('/analytics/accounts'),
  getTransactions: (params) => api.get('/analytics/transactions', { params }),
};

export default api;
