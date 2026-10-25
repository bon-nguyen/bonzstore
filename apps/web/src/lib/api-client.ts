import axios from 'axios';

export const WEB_TOKEN_KEY = 'bonzstore_web_token';

export const webApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

webApiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(WEB_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

webApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Lỗi kết nối API';
    return Promise.reject(
      new Error(Array.isArray(message) ? message.join(', ') : message),
    );
  },
);

