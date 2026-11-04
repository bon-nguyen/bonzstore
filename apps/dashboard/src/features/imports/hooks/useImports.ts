import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { importsApi } from '../../../api/endpoints/imports.api';
import {
  FetchExternalOrderPayload,
  HoabinhLoginPayload,
  ImportOrderTabType,
} from '../../../api/types/imports.types';

export function useImportOrders(params?: {
  page?: number;
  limit?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  UID?: number;
  OrderType?: number;
  tab?: ImportOrderTabType;
  search?: string;
  status?: string;
  site?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['imports', params],
    queryFn: () => importsApi.getAll(params),
    staleTime: 15 * 1000,
  });
}

export function useImportOrderDetail(id: number | null) {
  return useQuery({
    queryKey: ['imports', 'detail', id],
    queryFn: () => importsApi.getById(id || 55479),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useLoginHoabinh() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HoabinhLoginPayload) =>
      importsApi.loginHoabinh(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      const uid = res.decoded?.userData.UserId || 6176;
      const uname = res.decoded?.userData.UserName || 'tranbon1';
      toast.success(
        `Đăng nhập Hoà Bình Logistics thành công! Đã liên kết tài khoản ${uname} (UID: ${uid})`,
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Đăng nhập Hoà Bình Logistics thất bại');
    },
  });
}

export function useSaveImportToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      token: string;
      accountUsername?: string;
      loginUrl?: string;
      apiBaseUrl?: string;
    }) => importsApi.saveTokenConfig(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      toast.success(
        `Đã lưu Bearer Token & giải mã UID: ${res.uid || 6176} (${res.accountUsername})`,
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể lưu Token');
    },
  });
}

export function useSimulateImportTokenExpired() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => importsApi.simulateTokenExpired401(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      toast.warning(
        'Phiên Token Hoà Bình Logistics đã hết hạn (401 Unauthorized) — Vui lòng xác thực lại!',
      );
    },
  });
}

export function useUpdateImportOrderTab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      targetTab,
    }: {
      orderId: number;
      targetTab: ImportOrderTabType;
    }) => importsApi.updateWorkflowTab(orderId, targetTab),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      if (res.targetTab === 'APPROVED') {
        toast.success(
          `Đã duyệt đơn #${res.orderId} (OrderType = 2) & đồng bộ vào Kho Sản phẩm (/products) + Sổ Quỹ (/cashbook)`,
        );
      } else if (res.targetTab === 'DRAFT') {
        toast.info(
          `Đã chuyển đơn #${res.orderId} sang Danh sách đơn (Bản nháp — OrderType = 0)`,
        );
      } else {
        toast.success(
          `Đã chuyển đơn #${res.orderId} về Danh sách đơn (Hiện tại — OrderType = 1)`,
        );
      }
    },
  });
}

export function useFetchExternalImportOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FetchExternalOrderPayload) =>
      importsApi.fetchExternalOrder(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      const mode = res?.syncMeta?.sourceMode;
      const orderId = res?.Data?.Id || 55479;
      if (mode === 'LIVE_HOABINH_API') {
        toast.success(
          `Đã lấy trực tiếp đơn #${orderId} từ Hoà Bình Logistics & đồng bộ Sản phẩm + Sổ quỹ`,
        );
      } else {
        toast.success(
          `Đã nạp & lưu dữ liệu đơn #${orderId} (Auto-Restore) kèm đồng bộ Kho Sản phẩm & Sổ quỹ`,
        );
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Lỗi khi lấy chi tiết đơn hàng');
    },
  });
}

export function useSyncImportOrderToCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      priceMarkupMultiplier,
      categoryId,
    }: {
      orderId: number;
      priceMarkupMultiplier?: number;
      categoryId?: string;
    }) =>
      importsApi.syncToCatalog(orderId, {
        priceMarkupMultiplier,
        categoryId,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      toast.success(
        `Đã duyệt & đồng bộ ${res.syncedProductsCount} sản phẩm (${res.syncedSkusCount} SKU) từ đơn #${res.orderId} vào Kho Sản Phẩm (/products)`,
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Đồng bộ sản phẩm thất bại');
    },
  });
}

export function useRestoreImportsData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => importsApi.restoreDefaultData(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(
        res.message ||
          'Đã khôi phục (Restore) dữ liệu đơn nhập hàng #55479, Sản phẩm và Sổ quỹ',
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể khôi phục dữ liệu');
    },
  });
}
