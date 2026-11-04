import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { logisticsApi } from '../../../api/endpoints/logistics.api';
import {
  CreateLogisticsUnitPayload,
  UpdateLogisticsUnitPayload,
} from '../../../api/types/logistics.types';

export function useLogisticsUnits(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['logistics', params],
    queryFn: () => logisticsApi.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useCreateLogisticsUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLogisticsUnitPayload) =>
      logisticsApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['logistics'] });
      toast.success(`Đã thêm mới đơn vị Logistics "${res.name}"`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Thêm mới đơn vị Logistics thất bại');
    },
  });
}

export function useUpdateLogisticsUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateLogisticsUnitPayload;
    }) => logisticsApi.update(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['logistics'] });
      toast.success(`Đã cập nhật đơn vị Logistics "${res.name}"`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Cập nhật đơn vị Logistics thất bại');
    },
  });
}

export function useDeleteLogisticsUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => logisticsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics'] });
      toast.success('Đã xóa đơn vị Logistics');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Xóa đơn vị Logistics thất bại');
    },
  });
}

