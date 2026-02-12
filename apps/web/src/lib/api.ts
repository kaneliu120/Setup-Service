import axios from 'axios';

const getBaseURL = () => {
  // Server-side: use the full backend URL
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://setup-service-api.azurewebsites.net';
  }
  // Client-side: use relative path (proxied via rewrites)
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
