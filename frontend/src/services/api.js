/**
 * API Service - Centralized API calls with error handling and token refresh
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Flag to prevent infinite refresh token loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;

    // Handle 401 Unauthorized - attempt token refresh
    if (response?.status === 401 && config && !config.__isRetry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          config.headers.Authorization = `Bearer ${token}`;
          return api(config);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token available, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        processQueue(error, null);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        api.post('/auth/refresh', { refresh_token: refreshToken })
          .then(({ data }) => {
            const { access_token, refresh_token } = data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            config.headers.Authorization = `Bearer ${access_token}`;
            config.__isRetry = true;

            processQueue(null, access_token);
            resolve(api(config));
          })
          .catch((err) => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            processQueue(err, null);
            window.location.href = '/login';
            reject(err);
          });
      });
    }

    return Promise.reject(error);
  }
);


// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (credentials) => api.post('/auth/login', credentials),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  changePasswordFirstLogin: (data) => api.post('/auth/change-password-first-login', data),
  setMPIN: (mpin) => api.post('/auth/set-mpin', { mpin }),
  verifyMPIN: (mpin) => api.post('/auth/verify-mpin', { mpin }),
};

// Account endpoints
export const accountAPI = {
  create: (data) => api.post('/accounts', data),
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  getBalance: (id) => api.get(`/accounts/${id}/balance`),
  delete: (id) => api.delete(`/accounts/${id}`),
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

// Bill payment endpoints
export const billAPI = {
  getAll: (params) => api.get('/bills', { params }),
  getById: (id) => api.get(`/bills/${id}`),
  pay: (data) => api.post('/bills/pay', data),
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

// User management endpoints
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getCustomers: (search = '') => api.get('/users/customers', { params: { search } }),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  assignRole: (id, data) => api.post(`/users/${id}/assign-role`, data),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
};

// Message/Support ticket endpoints
export const messageAPI = {
  create: (data) => api.post('/messages', data),
  getAll: (params) => api.get('/messages', { params }),
  getById: (id) => api.get(`/messages/${id}`),
  delete: (id) => api.delete(`/messages/${id}`),
};

export default api;
