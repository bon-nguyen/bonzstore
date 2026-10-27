import { apiClient } from '../client';
import { PaginatedResponse } from '../types/auth.types';
import {
  CategoryItem,
  CreateCategoryDto,
  CreateProductDto,
  ProductItem,
  ProductQueryParams,
  ProductStats,
  ProductStatus,
  TikTokCategoryAssetsResponse,
} from '../types/catalog.types';

export const categoriesApi = {
  getAll: (): Promise<CategoryItem[]> => apiClient.get('/categories'),

  getTikTokAssets: (): Promise<TikTokCategoryAssetsResponse> =>
    apiClient.get('/categories/assets'),

  create: (data: CreateCategoryDto): Promise<CategoryItem> =>
    apiClient.post('/categories', data),

  syncTikTok: (): Promise<{ code: number; message: string; syncedCount: number }> =>
    apiClient.post('/categories/sync-tiktok'),
};

export const productsApi = {
  getStats: (): Promise<ProductStats> => apiClient.get('/products/stats'),

  getAll: (params?: ProductQueryParams): Promise<PaginatedResponse<ProductItem>> =>
    apiClient.get('/products', { params }),

  create: (data: CreateProductDto): Promise<ProductItem> =>
    apiClient.post('/products', data),

  updateStatus: (id: string, status: ProductStatus): Promise<ProductItem> =>
    apiClient.patch(`/products/${id}/status`, { status }),

  importFromPlatform: (payload: {
    platform: 'TIKTOK_SHOP' | 'SHOPEE';
    externalShopId?: string;
  }): Promise<{ code: number; message: string; data: ProductItem }> =>
    apiClient.post('/products/import-from-platform', payload),
};

