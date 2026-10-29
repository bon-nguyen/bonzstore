import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '../../../api/endpoints/users.api';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
} from '../../../api/types/user.types';
import { getErrorMessage } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';

export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useUserDetail(id?: string | null) {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => usersApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => usersApi.getStats(),
    staleTime: 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('api.userCreateSuccess', { email: created.email }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.userCreateError')));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('api.userUpdateSuccess', { name: updated.fullName }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.userUpdateError')));
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersApi.resetPassword(id, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('api.userResetPassSuccess'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.userResetPassError')));
    },
  });
}
