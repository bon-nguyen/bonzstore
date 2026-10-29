import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rolesApi } from '../../../api/endpoints/roles.api';
import { CreateRoleDto, UpdateRoleDto } from '../../../api/types/role.types';
import { getErrorMessage } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';

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
  const { t } = useI18n();

  return useMutation({
    mutationFn: (data: CreateRoleDto) => rolesApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(
        t('api.roleCreateSuccess', { name: created.name, code: created.code }),
      );
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.roleCreateError')));
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      rolesApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('api.roleUpdateSuccess', { name: updated.name }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.roleUpdateError')));
    },
  });
}
