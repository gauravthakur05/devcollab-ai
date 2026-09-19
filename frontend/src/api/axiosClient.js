import axios from 'axios';

// Centralized API configuration. Every request goes through this instance so
// the base URL, auth header, and error normalization live in exactly one place.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('devcollab_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize network errors (backend down, CORS, DNS) into the same
    // { success, message } shape the rest of the app expects, instead of
    // letting a raw Axios error ("Network Error") leak into the UI.
    if (!error.response) {
      error.normalizedMessage =
        'Cannot reach the server. Make sure the backend is running on the configured VITE_API_URL and that CORS is configured correctly.';
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('devcollab_token');
        localStorage.removeItem('devcollab_user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }

    error.normalizedMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject(error);
  }
);

export default axiosClient;
