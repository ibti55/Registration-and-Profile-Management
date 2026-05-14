import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bpsc-access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('bpsc-refresh-token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (data.success) {
            localStorage.setItem('bpsc-access-token', data.data.accessToken);
            localStorage.setItem('bpsc-refresh-token', data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem('bpsc-access-token');
          localStorage.removeItem('bpsc-refresh-token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
