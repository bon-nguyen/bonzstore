import { AuthUser, UserStatus } from './auth.types';

export type { UserStatus };

export type UserSortField =
  | 'role'
  | 'status'
  | 'createdAt'
  | 'fullName'
  | 'email';

export type SortOrder = 'asc' | 'desc';

export interface UserItem extends AuthUser {
  phone?: string | null;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  activeSessions?: number;
  isEmailMasked?: boolean;
  canManage?: boolean;
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
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
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

export interface ResetPasswordResponse {
  user: UserItem;
  message: string;
}
