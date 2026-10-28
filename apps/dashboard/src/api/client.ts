import axios from 'axios';
import { env } from '../config/env';
import {
  getCurrentLocale,
  translateBackendMessage,
  translateStatic,
} from '../features/i18n/I18nContext';

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
  const locale = getCurrentLocale();
  if (config.headers) {
    config.headers['Accept-Language'] = locale;
    config.headers['x-lang'] = locale;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    const rawMessage =
      error.response?.data?.message ||
      error.message ||
      translateStatic('api.networkError');
    const joinedMessage = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : String(rawMessage);
    return Promise.reject(new Error(translateBackendMessage(joinedMessage)));
  },
);
