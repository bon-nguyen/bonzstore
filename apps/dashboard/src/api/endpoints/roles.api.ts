import { apiClient } from '../client';
import {
  CreateRoleDto,
  PermissionItem,
  RoleItem,
  UpdateRoleDto,
} from '../types/role.types';

export const rolesApi = {
  getAll: (): Promise<RoleItem[]> => apiClient.get('/roles'),

  getPermissions: (): Promise<PermissionItem[]> =>
    apiClient.get('/roles/permissions'),

  create: (data: CreateRoleDto): Promise<RoleItem> =>
    apiClient.post('/roles', data),

  update: (id: string, data: UpdateRoleDto): Promise<RoleItem> =>
    apiClient.patch(`/roles/${id}`, data),
};

