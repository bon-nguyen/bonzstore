import { apiClient } from '../client';
import { AuthResponse, AuthUser, LoginPayload } from '../types/auth.types';

export const authApi = {
  adminLogin: (payload: LoginPayload): Promise<AuthResponse> =>
    apiClient.post('/auth/admin/login', payload),

  getMe: (): Promise<AuthUser> => apiClient.get('/auth/me'),

  logout: (refreshToken?: string): Promise<{ message: string }> =>
    apiClient.post('/auth/logout', { refreshToken }),
};

