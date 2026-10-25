export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string | null;
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  isAdminPanel: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  userCount: number;
  permissions: PermissionItem[];
  permissionCodes: string[];
}

export interface CreateRoleDto {
  code: string;
  name: string;
  description?: string;
  isAdminPanel?: boolean;
  permissionCodes?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isAdminPanel?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  permissionCodes?: string[];
}

