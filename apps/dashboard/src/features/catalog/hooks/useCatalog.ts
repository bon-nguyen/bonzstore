import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi, productsApi } from '../../../api/endpoints/catalog.api';
import {
  BulkProductActionDto,
  CategoryQueryParams,
  CreateCategoryDto,
  CreateProductDto,
  ProductQueryParams,
  ProductStatus,
  TagQueryParams,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateProductSkusDto,
} from '../../../api/types/catalog.types';
import { getErrorMessage } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';

export function useCategories() {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ['categories', locale],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 60 * 1000,
  });
}

export function usePaginatedCategories(params?: CategoryQueryParams) {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ['categories', 'paginated', locale, params],
    queryFn: () => categoriesApi.getPaginated(params),
    staleTime: 30 * 1000,
  });
}

export function useTikTokCategoryAssets() {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ['categories', 'tiktok-assets', locale],
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

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoriesApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('api.categoryUpdateSuccess', { name: updated.localName }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.categoryUpdateError')));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('api.categoryDeleteSuccess', { name: res.localName }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.categoryDeleteError')));
    },
  });
}

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useProductStats() {
  return useQuery({
    queryKey: ['products', 'stats'],
    queryFn: () => productsApi.getStats(),
    staleTime: 30 * 1000,
  });
}

export function useProductTags() {
  return useQuery({
    queryKey: ['products', 'tags'],
    queryFn: () => productsApi.getTags(),
    staleTime: 30 * 1000,
  });
}

export function usePaginatedProductTags(params?: TagQueryParams) {
  return useQuery({
    queryKey: ['products', 'tags', 'paginated', params],
    queryFn: () => productsApi.getPaginatedTags(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateOrAttachTag() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (payload: { name: string; productIds?: string[] }) =>
      productsApi.createOrAttachTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('api.tagCreateSuccess'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.productUpdateError')));
    },
  });
}

export function useRenameProductTag() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (payload: { name: string; newName: string }) =>
      productsApi.renameTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('api.tagRenameSuccess'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.productUpdateError')));
    },
  });
}

export function useDeleteProductTag() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (name: string) => productsApi.deleteTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('api.tagDeleteSuccess'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.productUpdateError')));
    },
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

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('api.productUpdateSuccess'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.productUpdateError')));
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
      toast.success(
        t('api.productStatusSuccess', {
          status: t(`status.${updated.status}` as any),
        }),
      );
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.productStatusError')));
    },
  });
}

export function useUpdateProductSkus() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductSkusDto;
    }) => productsApi.updateSkus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('api.skuUpdateSuccess'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.skuUpdateError')));
    },
  });
}

export function useBulkProductAction() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (payload: BulkProductActionDto) =>
      productsApi.bulkAction(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('api.bulkActionSuccess', { count: res.updatedCount }));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.bulkActionError')));
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
