import { AuthUser, UserStatus } from './auth.types';

export interface UserItem extends AuthUser {
  createdAt: string;
}

export interface UserStats {
  total: number;
  active: number;
  locked: number;
  adminUsers: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus | '';
  roleCode?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleIdOrCode: string;
  status?: UserStatus;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  roleIdOrCode?: string;
  status?: UserStatus;
  password?: string;
}

