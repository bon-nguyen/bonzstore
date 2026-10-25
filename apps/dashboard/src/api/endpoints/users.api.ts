import { apiClient } from '../client';
import { PaginatedResponse } from '../types/auth.types';
import {
  CreateUserDto,
  UpdateUserDto,
  UserItem,
  UserQueryParams,
  UserStats,
} from '../types/user.types';

export const usersApi = {
  getStats: (): Promise<UserStats> => apiClient.get('/users/stats'),

  getAll: (params?: UserQueryParams): Promise<PaginatedResponse<UserItem>> =>
    apiClient.get('/users', { params }),

  create: (data: CreateUserDto): Promise<UserItem> =>
    apiClient.post('/users', data),

  update: (id: string, data: UpdateUserDto): Promise<UserItem> =>
    apiClient.patch(`/users/${id}`, data),
};

