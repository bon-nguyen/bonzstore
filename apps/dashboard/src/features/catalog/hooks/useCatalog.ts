import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi, productsApi } from '../../../api/endpoints/catalog.api';
import {
  CreateCategoryDto,
  CreateProductDto,
  ProductQueryParams,
  ProductStatus,
} from '../../../api/types/catalog.types';
import { getErrorMessage } from '../../../lib/utils';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 60 * 1000,
  });
}

export function useTikTokCategoryAssets() {
  return useQuery({
    queryKey: ['categories', 'tiktok-assets'],
    queryFn: () => categoriesApi.getTikTokAssets(),
    staleTime: 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(`Đã tạo danh mục ${created.localName}`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Tạo danh mục thất bại'));
    },
  });
}

export function useSyncTikTokCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => categoriesApi.syncTikTok(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(`${res.message} (${res.syncedCount} danh mục)`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Đồng bộ danh mục thất bại'));
    },
  });
}

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
    staleTime: 60 * 1000,
  });
}

export function useProductStats() {
  return useQuery({
    queryKey: ['products', 'stats'],
    queryFn: () => productsApi.getStats(),
    staleTime: 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDto) => productsApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(`Đã thêm sản phẩm ${created.title}`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Thêm sản phẩm thất bại'));
    },
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      productsApi.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Đã chuyển trạng thái sang ${updated.status}`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Cập nhật trạng thái thất bại'));
    },
  });
}

export function useImportPlatformProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      platform: 'TIKTOK_SHOP' | 'SHOPEE';
      externalShopId?: string;
    }) => productsApi.importFromPlatform(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(res.message);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Đồng bộ sản phẩm thất bại'));
    },
  });
}
