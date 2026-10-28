import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '../../../api/endpoints/users.api';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
} from '../../../api/types/user.types';
import { getErrorMessage } from '../../../lib/utils';

export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
    staleTime: 60 * 1000,
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
  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Đã tạo tài khoản ${created.email}`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Tạo tài khoản thất bại'));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Đã cập nhật tài khoản ${updated.email}`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Cập nhật thất bại'));
    },
  });
}
