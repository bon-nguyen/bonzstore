export interface CategoryItem {
  id: string;
  externalCategoryId?: string | null;
  parentId?: string | null;
  parentName?: string | null;
  externalParentId?: string | null;
  localName: string;
  slug: string;
  level: number;
  isLeaf: boolean;
  categoryVersion: string;
  permissionStatuses: string[];
  status: 'ACTIVE' | 'INACTIVE';
  productCount: number;
  childrenCount: number;
}

export interface TikTokCategoryAssetsResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    category_assets: Array<{
      id: string;
      category: {
        id: string;
        parent_id: string;
        local_name: string;
        is_leaf: boolean;
      };
      version: string;
      permission_statuses: string[];
    }>;
  };
}

export interface CreateCategoryDto {
  localName: string;
  externalCategoryId?: string;
  parentId?: string;
  isLeaf?: boolean;
  categoryVersion?: string;
  permissionStatuses?: string[];
}

export type SourcePlatform = 'LOCAL' | 'TIKTOK_SHOP' | 'SHOPEE';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'FREEZE';

export interface ProductSkuItem {
  id: string;
  externalSkuId?: string | null;
  sellerSku: string;
  salesAttributes: Array<{ name: string; value_name: string }>;
  originalPrice: number;
  salePrice: number;
  currency: string;
  stockQuantity: number;
}

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  brandName?: string | null;
  status: ProductStatus;
  sourcePlatform: SourcePlatform;
  externalProductId?: string | null;
  externalShopId?: string | null;
  lastSyncedAt?: string | null;
  thumbnailUrl?: string | null;
  category?: {
    id: string;
    externalCategoryId?: string | null;
    localName: string;
    isLeaf: boolean;
  } | null;
  skuCount: number;
  minPrice: number;
  totalStock: number;
  skus: ProductSkuItem[];
  createdAt: string;
}

export interface ProductStats {
  total: number;
  active: number;
  syncedFromPlatform: number;
  totalStock: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus | '';
  sourcePlatform?: SourcePlatform | '';
  categoryId?: string;
}

export interface CreateProductDto {
  title: string;
  categoryId: string;
  brandName?: string;
  imageUrl?: string;
  sellerSku: string;
  originalPrice: number;
  salePrice: number;
  stockQuantity: number;
  sourcePlatform?: SourcePlatform;
}

