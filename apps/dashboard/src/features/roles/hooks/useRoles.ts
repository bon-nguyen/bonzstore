import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rolesApi } from '../../../api/endpoints/roles.api';
import { CreateRoleDto, UpdateRoleDto } from '../../../api/types/role.types';
import { getErrorMessage } from '../../../lib/utils';

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
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(`Đã tạo vai trò ${created.name} (${created.code})`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Tạo vai trò thất bại'));
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      rolesApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(`Đã cập nhật quyền hạn cho ${updated.name}`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Cập nhật quyền thất bại'));
    },
  });
}
