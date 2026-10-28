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
import { useI18n } from '../../i18n/I18nContext';

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
  const { t } = useI18n();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('api.categoryCreateSuccess', { name: created.localName }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.categoryCreateError')));
    },
  });
}

export function useSyncTikTokCategories() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => categoriesApi.syncTikTok(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('api.categorySyncSuccess', { count: res.syncedCount }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.categorySyncError')));
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
  const { t } = useI18n();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('api.productCreateSuccess', { title: created.title }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.productCreateError')));
    },
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      productsApi.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('api.productStatusSuccess', { status: updated.status }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.productStatusError')));
    },
  });
}

export function useImportPlatformProduct() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (payload: {
      platform: 'TIKTOK_SHOP' | 'SHOPEE';
      externalShopId?: string;
    }) => productsApi.importFromPlatform(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('api.productImportSuccess'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.productImportError')));
    },
  });
}
