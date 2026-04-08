import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://127.0.0.1:5000/api' : '/api', // Local Flask for Dev, Relative for Vercel
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
