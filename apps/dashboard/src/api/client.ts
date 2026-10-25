import axios from 'axios';
import { env } from '../config/env';

export const AUTH_TOKEN_KEY = 'bonzstore_admin_token';
export const REFRESH_TOKEN_KEY = 'bonzstore_admin_refresh_token';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi kết nối máy chủ';
    return Promise.reject(
      new Error(Array.isArray(message) ? message.join(', ') : message),
    );
  },
);

