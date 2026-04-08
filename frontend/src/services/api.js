import axios from 'axios';

const api = axios.create({
  baseURL: 'https://yumm-ym2m.onrender.com/api', // Render backend handles all environments
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to inject the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
