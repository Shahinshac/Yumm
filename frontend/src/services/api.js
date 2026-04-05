import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && !config.__isRetry) {
      config.__isRetry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: localStorage.getItem('refresh_token')
        });
        localStorage.setItem('access_token', data.access_token);
        config.headers.Authorization = `Bearer ${data.access_token}`;
        return api(config);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (creds) => api.post('/auth/login', creds),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getCustomers: (search = '') => api.get('/users/customers', { params: { search } }),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const accountAPI = {
  create: (data) => api.post('/accounts', data),
  getAll: (params) => api.get('/accounts', { params }),
  getById: (id) => api.get(`/accounts/${id}`),
  delete: (id) => api.delete(`/accounts/${id}`),
};

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
};

export const loanAPI = {
  getAll: (params) => api.get('/loans', { params }),
  create: (data) => api.post('/loans', data),
};

export const cardAPI = {
  getAll: (params) => api.get('/cards', { params }),
};

export const billAPI = {
  getAll: (params) => api.get('/bills', { params }),
  create: (data) => api.post('/bills', data),
};
