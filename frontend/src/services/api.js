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

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Restaurant APIs
export const restaurantAPI = {
  getAll: () => api.get('/restaurants'),
  getById: (id) => api.get(`/restaurants/${id}`),
  getMenu: (id) => api.get(`/restaurants/${id}/menu`),
  getCategories: () => api.get('/restaurants/categories'),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  track: (id) => api.get(`/orders/${id}/track`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Delivery APIs
export const deliveryAPI = {
  getAvailableOrders: () => api.get('/delivery/available-orders'),
  acceptOrder: (id) => api.post(`/delivery/accept-order/${id}`),
  getMyOrders: () => api.get('/delivery/my-orders'),
  updateLocation: (id, location) => api.put(`/delivery/${id}/update-location`, location),
  markDelivered: (id) => api.put(`/delivery/${id}/mark-delivered`),
  getStats: () => api.get('/delivery/stats'),
};

// Review APIs
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByRestaurant: (id) => api.get(`/reviews/restaurant/${id}`),
};

// Promo APIs
export const promoAPI = {
  validate: (code) => api.post('/promo/validate', { code }),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (role) => api.get('/admin/users', { params: { role } }),
  getRestaurants: () => api.get('/admin/restaurants'),
  getOrders: () => api.get('/admin/orders'),
  orderAnalytics: (period) => api.get('/admin/analytics/orders', { params: { period } }),
  restaurantAnalytics: () => api.get('/admin/analytics/restaurants'),
};
