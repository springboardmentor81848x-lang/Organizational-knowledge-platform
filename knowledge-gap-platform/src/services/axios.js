import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.knowledgegap-intelligence.enterprise.internal/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || 'mock-jwt-token-enterprise-2026';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Enterprise Axios Error]:', error?.response || error.message);
    return Promise.reject(error);
  }
);

export const mockApiResponse = (data, delay = 200) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, status: 200, statusText: 'OK' });
    }, delay);
  });
};

export default api;
