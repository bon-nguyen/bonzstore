import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../../../api/endpoints/roles.api';
import { CreateRoleDto, UpdateRoleDto } from '../../../api/types/role.types';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAll(),
    staleTime: 60 * 1000,
  });
}

export function usePermissionsCatalog() {
  return useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: () => rolesApi.getPermissions(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleDto) => rolesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

