import axios from 'axios';

const isServer = typeof window === 'undefined';
const baseURL = isServer
  ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  : '/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
