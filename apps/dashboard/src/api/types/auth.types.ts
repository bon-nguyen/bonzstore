export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

export interface RoleSummary {
  id: string;
  code: string;
  name: string;
  isAdminPanel: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  lastLoginAt?: string | null;
  role: RoleSummary;
  permissions: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthUser;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

