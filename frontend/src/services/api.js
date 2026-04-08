import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Vite proxy → local Flask in dev | Render in production
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
