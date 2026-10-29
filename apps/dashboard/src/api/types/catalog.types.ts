export interface CategoryItem {
  id: string;
  externalCategoryId: string | null;
  parentId: string | null;
  parentName: string | null;
  parentNameVi?: string | null;
  parentNameEn?: string | null;
  externalParentId: string | null;
  localName: string;
  localNameVi?: string;
  localNameEn?: string;
  slug: string;
  level: number;
  isLeaf: boolean;
  categoryVersion: string;
  permissionStatuses: string[];
  status: 'ACTIVE' | 'INACTIVE';
  productCount: number;
  directProductCount?: number;
  childrenCount: number;
}

export type CategorySortField = 'localName' | 'productCount' | 'status';

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | '';
  isLeaf?: 'true' | 'false';
  sortBy?: CategorySortField;
  sortOrder?: 'asc' | 'desc';
}

export interface TikTokCategoryAssetNode {
  id: string;
  cipher?: string;
  target_market?: string;
  category: {
    id: string;
    parent_id: string;
    local_name: string;
    is_leaf: boolean;
  };
  version: string;
  permission_statuses: string[];
}

export interface TikTokCategoryAssetsResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    category_assets: TikTokCategoryAssetNode[];
  };
}

export interface CreateCategoryDto {
  localName: string;
  externalCategoryId?: string;
  parentId?: string;
  isLeaf?: boolean;
  categoryVersion?: string;
  permissionStatuses?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateCategoryDto {
  localName?: string;
  externalCategoryId?: string;
  parentId?: string | null;
  isLeaf?: boolean;
  categoryVersion?: string;
  permissionStatuses?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
}

export type SourcePlatform = 'LOCAL' | 'TIKTOK_SHOP' | 'SHOPEE';

export type ProductStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'FAILED'
  | 'FREEZE'
  | 'INACTIVE'
  | 'DRAFT'
  | 'DELETED';

export type ProductTabFilter = 'ALL' | ProductStatus;

export interface ProductSkuItem {
  id: string;
  externalSkuId: string | null;
  sellerSku: string;
  salesAttributes: Array<{ name: string; value_name: string }>;
  originalPrice: number;
  salePrice: number;
  stockQuantity: number;
}

export interface ProductPerformance {
  soldCount: number;
  viewCount: number;
  revenue: number;
}

export interface ProductTagSummary {
  name: string;
  count: number;
}

export type TagSortField = 'name' | 'count';

export interface TagQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: TagSortField;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  brandName: string | null;
  status: ProductStatus;
  dbStatus?: string;
  attentionReason?: string | null;
  tags: string[];
  performance: ProductPerformance;
  sourcePlatform: SourcePlatform;
  externalProductId: string | null;
  externalShopId: string | null;
  lastSyncedAt: string | null;
  thumbnailUrl: string | null;
  category: {
    id: string;
    externalCategoryId: string | null;
    localName: string;
    isLeaf: boolean;
    cipher?: string;
  } | null;
  skuCount: number;
  outOfStockSkuCount: number;
  minPrice: number;
  maxPrice: number;
  minOriginalPrice: number;
  maxOriginalPrice: number;
  totalStock: number;
  skus: ProductSkuItem[];
  updatedAt: string;
  createdAt: string;
}

export interface ProductStats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  inactive: number;
  draft: number;
  deleted: number;
  outOfStock: number;
  syncedFromPlatform: number;
  totalStock: number;
  tags: ProductTagSummary[];
}

export interface CreateProductDto {
  title: string;
  categoryId: string;
  brandName?: string;
  descriptionHtml?: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  sellerSku?: string;
  originalPrice?: number;
  salePrice?: number;
  stockQuantity?: number;
  sourcePlatform?: SourcePlatform;
  status?: ProductStatus;
  tags?: string[];
  salesAttributes?: Array<{ name: string; value_name: string }>;
  attributes?: Array<{ name: string; value: string }>;
  packageWeight?: number;
  skus?: Array<{
    sellerSku: string;
    originalPrice: number;
    salePrice?: number;
    stockQuantity: number;
    imageUrl?: string;
    salesAttributes?: Array<{
      name: string;
      value_name: string;
      sku_img?: string;
    }>;
  }>;
}

export interface UpdateProductDto {
  title?: string;
  categoryId?: string;
  brandName?: string;
  imageUrl?: string;
  status?: ProductStatus;
  tags?: string[];
}

export interface UpdateProductSkusDto {
  skus: Array<{
    id?: string;
    sellerSku: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
    salesAttributes?: Array<{ name: string; value_name: string }>;
  }>;
}

export interface BulkProductActionDto {
  productIds: string[];
  action:
    | 'ACTIVATE'
    | 'DEACTIVATE'
    | 'PENDING'
    | 'DRAFT'
    | 'DELETE'
    | 'ADD_TAG'
    | 'REMOVE_TAG';
  tag?: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductTabFilter;
  sourcePlatform?: SourcePlatform;
  categoryId?: string;
  tag?: string;
  outOfStock?: string;
  stockState?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  minPrice?: string;
  maxPrice?: string;
  hasDiscount?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'stock' | 'soldCount' | 'status';
  sortOrder?: 'asc' | 'desc';
}
