import {
   keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { cashbookApi } from '../../../api/endpoints/cashbook.api';
import {
  CashbookVoucherType,
  CreateCashbookSourceCategoryPayload,
  CreateCashbookVoucherPayload,
  UpdateCashbookSourceCategoryPayload,
} from '../../../api/types/cashbook.types';

export function useCashbookVouchers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'ALL' | CashbookVoucherType;
  category?: string;
  paymentChannel?: 'ALL' | 'CASH' | 'CARD' | 'TRANSFER';
  startDate?: string;
  endDate?: string;
  importOrderId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['cashbook', 'vouchers', params],
    queryFn: () => cashbookApi.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useCashbookSourceCategories(type?: CashbookVoucherType) {
  return useQuery({
    queryKey: ['cashbook', 'source-categories', type || 'ALL'],
    queryFn: () => cashbookApi.getSourceCategories(type),
    staleTime: 30 * 1000,
  });
}

export function useCreateCashbookSourceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCashbookSourceCategoryPayload) =>
      cashbookApi.createSourceCategory(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(
        variables.type === 'INCOME'
          ? `Đã tạo loại nguồn thu "${res.name}" (${res.code})`
          : `Đã tạo loại khoản chi "${res.name}" (${res.code})`,
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể tạo nguồn thu / khoản chi');
    },
  });
}

export function useUpdateCashbookSourceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCashbookSourceCategoryPayload;
    }) => cashbookApi.updateSourceCategory(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Đã cập nhật "${res.name}" (${res.code})`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể cập nhật nguồn thu / khoản chi');
    },
  });
}

export function useDeleteCashbookSourceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cashbookApi.deleteSourceCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã xóa loại nguồn thu / khoản chi');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể xóa nguồn thu / khoản chi');
    },
  });
}

export function useCashbookCharts() {
  return useQuery({
    queryKey: ['cashbook', 'charts'],
    queryFn: () => cashbookApi.getChartsAnalytics(),
    staleTime: 30 * 1000,
  });
}

export function useCreateCashbookVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCashbookVoucherPayload) =>
      cashbookApi.createVoucher(data),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(
        variables.type === 'INCOME'
          ? 'Đã lập Phiếu Thu thành công và cập nhật Sổ Quỹ'
          : 'Đã lập Phiếu Chi thành công và cập nhật Sổ Quỹ',
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể lập phiếu sổ quỹ');
    },
  });
}

export function useUpdateCashbookVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCashbookVoucherPayload>;
    }) => cashbookApi.updateVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã cập nhật phiếu sổ quỹ và ghi nhận thông báo hệ thống');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Cập nhật phiếu thất bại');
    },
  });
}

export function useDeleteCashbookVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cashbookApi.deleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã xóa phiếu khỏi Sổ Quỹ và ghi nhận thông báo hệ thống');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Xóa phiếu thất bại');
    },
  });
}

export function useUpdateOpeningBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { cash: number; card: number; transfer: number }) =>
      cashbookApi.updateOpeningBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã cập nhật Số dư Đầu kỳ Sổ Quỹ');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể cập nhật số dư đầu kỳ');
    },
  });
}

export function useRestoreCashbookData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cashbookApi.restoreDefaultData(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(
        res.message || 'Đã khôi phục (Restore) dữ liệu Sổ Quỹ thành công',
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể khôi phục dữ liệu sổ quỹ');
    },
  });
}

