import { apiClient } from '../client';
import { PaginatedResponse } from '../types/auth.types';
import {
  BulkProductActionDto,
  CategoryItem,
  CategoryQueryParams,
  CreateCategoryDto,
  CreateProductDto,
  ProductItem,
  ProductQueryParams,
  ProductStats,
  ProductStatus,
  ProductTagSummary,
  TikTokCategoryAssetsResponse,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateProductSkusDto,
} from '../types/catalog.types';

export const categoriesApi = {
  getAll: (): Promise<CategoryItem[]> => apiClient.get('/categories'),

  getPaginated: (
    params?: CategoryQueryParams,
  ): Promise<PaginatedResponse<CategoryItem>> =>
    apiClient.get('/categories/paginated', { params }),

  getTikTokAssets: (): Promise<TikTokCategoryAssetsResponse> =>
    apiClient.get('/categories/assets'),

  create: (data: CreateCategoryDto): Promise<CategoryItem> =>
    apiClient.post('/categories', data),

  update: (id: string, data: UpdateCategoryDto): Promise<CategoryItem> =>
    apiClient.patch(`/categories/${id}`, data),

  delete: (
    id: string,
  ): Promise<{ id: string; localName: string; deleted: boolean; message: string }> =>
    apiClient.delete(`/categories/${id}`),
};

export const productsApi = {
  getStats: (): Promise<ProductStats> => apiClient.get('/products/stats'),

  getTags: (): Promise<ProductTagSummary[]> => apiClient.get('/products/tags'),

  createOrAttachTag: (payload: {
    name: string;
    productIds?: string[];
  }): Promise<ProductTagSummary[]> => apiClient.post('/products/tags', payload),

  renameTag: (payload: {
    name: string;
    newName: string;
  }): Promise<ProductTagSummary[]> =>
    apiClient.patch('/products/tags/rename', payload),

  deleteTag: (name: string): Promise<ProductTagSummary[]> =>
    apiClient.post('/products/tags/delete', { name }),

  getAll: (params?: ProductQueryParams): Promise<PaginatedResponse<ProductItem>> =>
    apiClient.get('/products', { params }),

  create: (data: CreateProductDto): Promise<ProductItem> =>
    apiClient.post('/products', data),

  update: (id: string, data: UpdateProductDto): Promise<ProductItem> =>
    apiClient.patch(`/products/${id}`, data),

  updateStatus: (id: string, status: ProductStatus): Promise<ProductItem> =>
    apiClient.patch(`/products/${id}/status`, { status }),

  updateSkus: (
    id: string,
    payload: UpdateProductSkusDto,
  ): Promise<ProductItem> => apiClient.patch(`/products/${id}/skus`, payload),

  bulkAction: (
    payload: BulkProductActionDto,
  ): Promise<{ code: number; updatedCount: number }> =>
    apiClient.post('/products/bulk-action', payload),

  importFromPlatform: (payload: {
    platform: 'TIKTOK_SHOP' | 'SHOPEE';
    externalShopId?: string;
  }): Promise<{ code: number; message: string; data: ProductItem }> =>
    apiClient.post('/products/import-from-platform', payload),
};
