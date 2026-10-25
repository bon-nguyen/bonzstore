import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../../api/endpoints/users.api';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
} from '../../../api/types/user.types';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

