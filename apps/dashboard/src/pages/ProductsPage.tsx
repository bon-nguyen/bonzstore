import isEmpty from 'lodash/isEmpty';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  CloudDownload,
  Copy,
  Eye,
  Filter,
  Info,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ProductItem,
  ProductStatus,
  ProductTabFilter,
  SourcePlatform,
} from '../api/types/catalog.types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Pagination } from '../components/ui/pagination';
import { Select } from '../components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { PERMISSIONS } from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { CatalogSubNav } from '../features/catalog/components/CatalogSubNav';
import { CreateProductDialog } from '../features/catalog/components/CreateProductDialog';
import { EditProductDialog } from '../features/catalog/components/EditProductDialog';
import {
  ProductDrawerFilterValues,
  ProductFilterDrawer,
} from '../features/catalog/components/ProductFilterDrawer';
import { QuickEditPriceDialog } from '../features/catalog/components/QuickEditPriceDialog';
import { QuickEditStockDialog } from '../features/catalog/components/QuickEditStockDialog';
import {
  useBulkProductAction,
  useCategories,
  useImportPlatformProduct,
  useProducts,
  useProductStats,
  useUpdateProductStatus,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { PageHeader } from '../features/shared/PageHeader';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { cn, formatCurrencyVND } from '../lib/utils';

type SortField = 'updatedAt' | 'price' | 'stock' | 'soldCount' | 'status';

function formatTikTokUpdateTime(dateStr: string, locale: string): string {
  try {
    const d = new Date(dateStr);
    const time = d.toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const weekday = d.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      weekday: 'long',
    });
    return `${time} ${weekday}`;
  } catch {
    return '19:30 thứ Tư';
  }
}

function formatPriceRange(min: number, max: number): string {
  if (!min && !max) return formatCurrencyVND(0);
  if (min === max) return formatCurrencyVND(min);
  return `${formatCurrencyVND(min)} - ${formatCurrencyVND(max)}`;
}

export function ProductsPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state from URL search params
  const urlTab = (searchParams.get('tab') as ProductTabFilter) || 'ALL';
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('categoryId') || '';
  const urlTag = searchParams.get('tag') || '';
  const urlPlatform = (searchParams.get('platform') as SourcePlatform) || '';
  const urlOutOfStock = searchParams.get('outOfStock') === 'true';
  const urlStockState =
    (searchParams.get(
      'stockState',
    ) as ProductDrawerFilterValues['stockState']) || 'all';
  const urlMinPrice = searchParams.get('minPrice') || '';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlHasDiscount = searchParams.get('hasDiscount') === 'true';
  const urlPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const urlLimit = Math.min(
    50,
    Math.max(10, Number(searchParams.get('limit')) || 20),
  );
  const urlSortBy = (searchParams.get('sortBy') as SortField) || 'updatedAt';
  const urlSortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  // Expanded SKU rows & Selected Product checkboxes
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenuProductId, setOpenMenuProductId] = useState<string | null>(
    null,
  );
  const [bulkTagInput, setBulkTagInput] = useState('');

  // Dialog & Drawer states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null,
  );
  const [stockModalProduct, setStockModalProduct] =
    useState<ProductItem | null>(null);
  const [priceModalProduct, setPriceModalProduct] =
    useState<ProductItem | null>(null);

  // Sync debounced search to URL query params
  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed === urlSearch) return;
    const next = new URLSearchParams(searchParams);
    if (!isEmpty(trimmed)) {
      next.set('search', trimmed);
    } else {
      next.delete('search');
    }
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, urlSearch, searchParams, setSearchParams]);

  const updateUrlParams = (
    updates: Record<string, string | number | undefined>,
  ) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (
        v === undefined ||
        v === '' ||
        v === 'ALL' ||
        v === 'all' ||
        v === 'false'
      ) {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    setSearchParams(next);
  };

  const { data: stats } = useProductStats();
  const { data: categories = [] } = useCategories();
  const {
    data: productsRes,
    isLoading,
    isFetching,
  } = useProducts({
    page: urlPage,
    limit: urlLimit,
    status: urlTab === 'ALL' ? undefined : urlTab,
    search: !isEmpty(urlSearch) ? urlSearch : undefined,
    categoryId: !isEmpty(urlCategory) ? urlCategory : undefined,
    tag: !isEmpty(urlTag) ? urlTag : undefined,
    sourcePlatform: !isEmpty(urlPlatform) ? urlPlatform : undefined,
    outOfStock: urlOutOfStock ? 'true' : undefined,
    stockState: urlStockState !== 'all' ? urlStockState : undefined,
    minPrice: !isEmpty(urlMinPrice) ? urlMinPrice : undefined,
    maxPrice: !isEmpty(urlMaxPrice) ? urlMaxPrice : undefined,
    hasDiscount: urlHasDiscount ? 'true' : undefined,
    sortBy: urlSortBy,
    sortOrder: urlSortOrder,
  });

  const importMutation = useImportPlatformProduct();
  const updateStatusMutation = useUpdateProductStatus();
  const bulkMutation = useBulkProductAction();

  const leafCategories = categories.filter((c) => c.isLeaf);
  const products = productsRes?.data || [];
  const meta = productsRes?.meta;

  // 7 TikTok Shop Seller Center Tabs from .feature/test.md
  const statusTabs: Array<{
    key: ProductTabFilter;
    label: string;
    count?: number;
    highlightAttention?: boolean;
  }> = [
    { key: 'ALL', label: t('products.tabAll'), count: stats?.total },
    { key: 'ACTIVE', label: t('products.tabActive'), count: stats?.active },
    { key: 'PENDING', label: t('products.tabPending'), count: stats?.pending },
    {
      key: 'FAILED',
      label: t('products.tabFailed'),
      count: stats?.failed,
      highlightAttention: (stats?.failed || 0) > 0,
    },
    {
      key: 'INACTIVE',
      label: t('products.tabInactive'),
      count: stats?.inactive,
    },
    { key: 'DRAFT', label: t('products.tabDraft'), count: stats?.draft },
    { key: 'DELETED', label: t('products.tabDeleted'), count: stats?.deleted },
  ];

  const toggleExpandSku = (productId: string) => {
    setExpandedRowIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const allCurrentSelected =
    products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !products.some((p) => p.id === id)),
      );
    } else {
      const pageIds = products.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSortColumn = (field: SortField) => {
    if (urlSortBy === field) {
      updateUrlParams({
        sortOrder: urlSortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      updateUrlParams({ sortBy: field, sortOrder: 'desc', page: 1 });
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (urlSortBy !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-45" />;
    }
    return urlSortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-foreground dark:text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-foreground dark:text-primary" />
    );
  };

  const handleCopyProductId = (idText: string) => {
    navigator.clipboard.writeText(idText);
    toast.success(t('products.copiedId', { id: idText }));
  };

  const handleBulkAction = async (
    action:
      | 'ACTIVATE'
      | 'DEACTIVATE'
      | 'PENDING'
      | 'DRAFT'
      | 'DELETE'
      | 'ADD_TAG',
    tag?: string,
  ) => {
    if (selectedIds.length === 0) return;
    await bulkMutation.mutateAsync({
      productIds: selectedIds,
      action,
      tag,
    });
    setSelectedIds([]);
    setBulkTagInput('');
  };

  const drawerFilterCount = [
    !isEmpty(urlTag),
    !isEmpty(urlPlatform),
    urlStockState !== 'all',
    !isEmpty(urlMinPrice) || !isEmpty(urlMaxPrice),
    urlHasDiscount,
  ].filter(Boolean).length;

  const hasActiveFilters =
    !isEmpty(urlSearch) ||
    !isEmpty(urlCategory) ||
    urlOutOfStock ||
    drawerFilterCount > 0;

  const renderStatusDotAndLabel = (status: ProductStatus) => {
    const config: Record<
      ProductStatus,
      { dotColor: string; label: string }
    > = {
      ACTIVE: {
        dotColor: 'bg-[#2D9F4B]',
        label: t('products.tabActive'),
      },
      PENDING: {
        dotColor: 'bg-amber-500',
        label: t('products.tabPending'),
      },
      FAILED: {
        dotColor: 'bg-destructive',
        label: t('products.tabFailed'),
      },
      FREEZE: {
        dotColor: 'bg-destructive',
        label: t('products.tabFailed'),
      },
      INACTIVE: {
        dotColor: 'bg-[#747378]',
        label: t('products.tabInactive'),
      },
      DRAFT: {
        dotColor: 'bg-sky-500',
        label: t('products.tabDraft'),
      },
      DELETED: {
        dotColor: 'bg-muted-foreground/50',
        label: t('products.tabDeleted'),
      },
    };
    const item = config[status] || config.ACTIVE;
    return (
      <div className="flex items-center gap-2">
        <span
          className={cn('h-2 w-2 shrink-0 rounded-full', item.dotColor)}
        />
        <span className="font-medium text-foreground">{item.label}</span>
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Sub-navigation: 1. Tất cả sản phẩm | 2. Danh mục | 3. Thẻ */}
      <CatalogSubNav
        productCount={stats?.total}
        categoryCount={categories.length}
        tagCount={stats?.tags?.length}
      />

      <PageHeader
        subtitle={t('products.subtitle')}
        title={t('products.title')}
        badge={`${stats?.total ?? 0} Products`}
        description={t('products.desc')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PermissionGate permission={PERMISSIONS.PRODUCTS_SYNC}>
              <Button
                variant="outline"
                disabled={importMutation.isPending}
                onClick={() =>
                  importMutation.mutate({ platform: 'TIKTOK_SHOP' })
                }
              >
                <CloudDownload className="h-4 w-4" />
                <span>{t('products.copyTiktok')}</span>
              </Button>

              <Button
                variant="outline"
                disabled={importMutation.isPending}
                onClick={() => importMutation.mutate({ platform: 'SHOPEE' })}
              >
                <RefreshCw className="h-4 w-4" />
                <span>{t('products.copyShopee')}</span>
              </Button>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.PRODUCTS_MANAGE}>
              <Button onClick={() => navigate('/products/create')}>
                <Plus className="h-4 w-4" />
                <span>{t('products.addBtn')}</span>
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {/* Product Catalog Card Container */}
      <div className="section-container">
        <div className="section-container-header">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Package className="h-4 w-4 text-teal-700 dark:text-primary" />
              <span>Danh sách Sản phẩm & Biến thể SKU</span>
              <span className="rounded-md border border-teal-700/25 bg-teal-700 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white shadow-sm dark:border-primary/30 dark:bg-primary/20 dark:text-primary">
                BonzStore Product Catalog
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Theo dõi tồn kho, giá bán, hiệu suất đơn hàng và đồng bộ sản phẩm trên Website
            </p>
          </div>
          <span className="status-badge status-active font-mono text-xs">
            {t('products.totalRows', { total: meta?.total ?? stats?.total ?? 0 })}
          </span>
        </div>

        {/* 1. 7 Status Tabs Bar (Tất cả / Trên kệ / Đang xem xét / Cần chú ý / Đã vô hiệu hóa / Bản nháp / Đã xóa) */}
        <div
          role="tablist"
          className="flex items-center gap-1 overflow-x-auto border-b border-border bg-muted/20 px-4 pt-2"
        >
          {statusTabs.map((tab) => {
            const isActive = urlTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() =>
                  updateUrlParams({
                    tab: tab.key === 'ALL' ? undefined : tab.key,
                    page: 1,
                  })
                }
                className={cn(
                  'relative flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-foreground text-foreground dark:border-primary dark:text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' ? (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 font-mono text-xs font-bold',
                      tab.highlightAttention
                        ? 'bg-destructive/15 text-destructive'
                        : isActive
                          ? 'bg-primary/25 text-foreground dark:text-primary'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* 2. Search & Filter Bar (test.md structure) */}
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input: Tên sản phẩm, ID hoặc SKU */}
            <div className="relative min-w-[260px] flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('products.searchPlaceholder')}
                className="pl-9 pr-8 text-xs"
              />
              {!isEmpty(searchInput) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateUrlParams({ search: undefined, page: 1 });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            {/* Hạng mục (Category Filter) */}
            <Select
              value={urlCategory}
              onChange={(e) =>
                updateUrlParams({
                  categoryId: e.target.value || undefined,
                  page: 1,
                })
              }
              placeholder={t('products.categoryFilterPlaceholder')}
              options={categories.map((c) => ({
                value: c.id,
                label: `${c.level > 1 ? '↳ ' : ''}${c.localName} (#${c.externalCategoryId})`,
              }))}
              className="w-full text-xs sm:w-56"
            />

            {/* Hết hàng <count> quick toggle button (test.md line 83) */}
            <button
              type="button"
              onClick={() =>
                updateUrlParams({
                  outOfStock: urlOutOfStock ? undefined : 'true',
                  page: 1,
                })
              }
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors',
                urlOutOfStock
                  ? 'border-destructive bg-destructive/15 text-destructive'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              <span>{t('products.outOfStockBtn')}</span>
              <span className="font-mono font-bold">
                {stats?.outOfStock ?? 0}
              </span>
            </button>

            {/* Nút Bộ lọc (Mở Slide-over Drawer giống TikTok Shop Seller Center test.md line 86) */}
            <button
              type="button"
              onClick={() => setShowFilterDrawer(true)}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-xs font-semibold transition-colors',
                drawerFilterCount > 0
                  ? 'border-foreground bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Bộ lọc</span>
              {drawerFilterCount > 0 ? (
                <span className="rounded-full bg-background/25 px-1.5 py-0.5 font-mono text-[10px] font-bold">
                  {drawerFilterCount}
                </span>
              ) : null}
            </button>

            {/* Sắp xếp theo (Sort dropdown) */}
            <Select
              value={`${urlSortBy}:${urlSortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(':');
                updateUrlParams({
                  sortBy: sortBy || 'updatedAt',
                  sortOrder: sortOrder || 'desc',
                  page: 1,
                });
              }}
              options={[
                {
                  value: 'updatedAt:desc',
                  label: t('products.sortUpdatedDesc'),
                },
                { value: 'price:asc', label: t('products.sortPriceAsc') },
                { value: 'price:desc', label: t('products.sortPriceDesc') },
                { value: 'stock:asc', label: t('products.sortStockAsc') },
                { value: 'stock:desc', label: t('products.sortStockDesc') },
                { value: 'soldCount:desc', label: t('products.sortSoldDesc') },
              ]}
              className="w-full text-xs sm:w-52"
            />

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  setSearchParams(
                    urlTab !== 'ALL' ? { tab: urlTab } : {},
                  );
                }}
                className="text-xs"
              >
                {t('products.resetFilters')}
              </Button>
            ) : null}
          </div>

          {/* Active Drawer Filter Chips */}
          {drawerFilterCount > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-muted-foreground">Đang lọc:</span>
              {!isEmpty(urlTag) ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/15 px-2 py-0.5 font-medium text-foreground dark:text-primary">
                  Thẻ: {urlTag}
                  <button
                    type="button"
                    onClick={() => updateUrlParams({ tag: undefined, page: 1 })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
              {!isEmpty(urlPlatform) ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/15 px-2 py-0.5 font-medium text-foreground dark:text-primary">
                  Nguồn: {urlPlatform}
                  <button
                    type="button"
                    onClick={() =>
                      updateUrlParams({ platform: undefined, page: 1 })
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
              {urlStockState !== 'all' ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/15 px-2 py-0.5 font-medium text-foreground dark:text-primary">
                  Tồn kho: {urlStockState}
                  <button
                    type="button"
                    onClick={() =>
                      updateUrlParams({ stockState: undefined, page: 1 })
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
              {!isEmpty(urlMinPrice) || !isEmpty(urlMaxPrice) ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/15 px-2 py-0.5 font-mono font-medium text-foreground dark:text-primary">
                  Giá: {urlMinPrice || '0'}₫ – {urlMaxPrice || '∞'}₫
                  <button
                    type="button"
                    onClick={() =>
                      updateUrlParams({
                        minPrice: undefined,
                        maxPrice: undefined,
                        page: 1,
                      })
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
              {urlHasDiscount ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/15 px-2 py-0.5 font-medium text-foreground dark:text-primary">
                  Đang khuyến mãi
                  <button
                    type="button"
                    onClick={() =>
                      updateUrlParams({ hasDiscount: undefined, page: 1 })
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Bulk Action Bar when rows are checked */}
          {selectedIds.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {t('products.selectedCount', { count: selectedIds.length })}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-muted-foreground underline hover:text-foreground"
                >
                  Bỏ chọn
                </button>
              </div>

              <PermissionGate permission={PERMISSIONS.PRODUCTS_MANAGE}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={bulkMutation.isPending}
                    onClick={() => handleBulkAction('ACTIVATE')}
                    className="h-7 text-xs"
                  >
                    {t('products.bulkActivate')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={bulkMutation.isPending}
                    onClick={() => handleBulkAction('DEACTIVATE')}
                    className="h-7 text-xs"
                  >
                    {t('products.bulkDeactivate')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={bulkMutation.isPending}
                    onClick={() => handleBulkAction('DRAFT')}
                    className="h-7 text-xs"
                  >
                    {t('products.bulkDraft')}
                  </Button>

                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      placeholder="Tên thẻ..."
                      value={bulkTagInput}
                      onChange={(e) => setBulkTagInput(e.target.value)}
                      className="h-7 w-28 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={
                        bulkMutation.isPending || isEmpty(bulkTagInput.trim())
                      }
                      onClick={() =>
                        handleBulkAction('ADD_TAG', bulkTagInput.trim())
                      }
                      className="h-7 text-xs"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{t('products.bulkAddTag')}</span>
                    </Button>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={bulkMutation.isPending}
                    onClick={() => handleBulkAction('DELETE')}
                    className="h-7 text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{t('products.bulkDelete')}</span>
                  </Button>
                </div>
              </PermissionGate>
            </div>
          ) : null}
        </div>

        {/* Loading indicator */}
        {isFetching && !isLoading ? (
          <div className="h-0.5 w-full animate-pulse bg-primary" />
        ) : null}

        {/* 3. TikTok Shop Seller Center Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-display text-[11px] font-bold uppercase text-muted-foreground">
                <th className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-border accent-foreground"
                  />
                </th>
                <th className="min-w-[290px] max-w-[360px] px-3 py-3">
                  {t('products.colProduct')}
                </th>
                <th className="min-w-[165px] px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSortColumn('soldCount')}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <span>{t('products.colPerformance')}</span>
                      {renderSortIcon('soldCount')}
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Số món bán ra, Lượt xem & Doanh số đồng bộ từ TikTok
                        Shop
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="min-w-[145px] px-3 py-3">
                  <button
                    type="button"
                    onClick={() => handleSortColumn('status')}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <span>{t('products.colStatus')}</span>
                    {renderSortIcon('status')}
                  </button>
                </th>
                <th className="min-w-[125px] px-3 py-3">
                  <button
                    type="button"
                    onClick={() => handleSortColumn('stock')}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <span>{t('products.colStock')}</span>
                    {renderSortIcon('stock')}
                  </button>
                </th>
                <th className="min-w-[195px] px-3 py-3">
                  <button
                    type="button"
                    onClick={() => handleSortColumn('price')}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <span>{t('products.colRetailPrice')}</span>
                    {renderSortIcon('price')}
                  </button>
                </th>
                <th className="w-28 px-4 py-3 text-right">
                  {t('products.colActions')}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={7} className="px-4 py-6">
                      <div className="h-12 rounded-lg bg-muted/60" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-14 text-center text-sm text-muted-foreground"
                  >
                    {t('app.empty')}
                  </td>
                </tr>
              ) : (
                products.map((item) => {
                  const isExpanded = !!expandedRowIds[item.id];
                  const isSelected = selectedIds.includes(item.id);
                  const displayId = item.externalProductId || item.id;

                  return (
                    <Fragment key={item.id}>
                      {/* Main Product Row (tr.core-table-row in test.md) */}
                      <tr
                        className={cn(
                          'group transition-colors hover:bg-muted/25',
                          isSelected && 'bg-primary/5',
                        )}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3.5 text-center align-top">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(item.id)}
                            className="mt-1 h-4 w-4 rounded border-border accent-foreground"
                          />
                        </td>

                        {/* Col 1: Sản phẩm (Thumbnail + Hover Eye + 2-line Title + ID Copy + Tags) */}
                        <td className="max-w-[360px] px-3 py-3.5 align-top">
                          <div className="flex items-start gap-3">
                            {/* Image with Hover Preview Eye */}
                            <button
                              type="button"
                              onClick={() => setEditingProduct(item)}
                              className="group/img relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
                              title={t('products.previewImageTitle')}
                            >
                              {item.thumbnailUrl ? (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover/img:opacity-100">
                                <Eye className="h-4 w-4 text-white" />
                              </span>
                            </button>

                            <div className="min-w-0 flex-1 space-y-1">
                              {/* Product Title (2-line clamp + hover eye icon) */}
                              <div className="flex items-start gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct(item)}
                                  className="line-clamp-2 text-left text-xs font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                                  title={item.title}
                                >
                                  {item.title}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct(item)}
                                  className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                  title={t('products.previewImageTitle')}
                                >
                                  <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                </button>
                              </div>

                              {/* ID:<externalProductId> + Copy icon */}
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                                <span>ID:{displayId}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyProductId(displayId)}
                                  className="rounded p-0.5 opacity-70 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                                  title="Sao chép ID sản phẩm"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Category & Tags badges */}
                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                {item.category ? (
                                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {item.category.localName}
                                  </span>
                                ) : null}
                                {(item.tags || []).map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() =>
                                      updateUrlParams({ tag, page: 1 })
                                    }
                                    className="inline-flex items-center gap-0.5 rounded border border-primary/30 bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-foreground transition hover:bg-primary/30 dark:text-primary"
                                  >
                                    <Tag className="h-2.5 w-2.5" />
                                    <span>{tag}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Col 2: Hiệu suất (3 món bán ra / Lượt xem: 4.852 / Doanh số: 115.650₫) */}
                        <td className="px-3 py-3.5 align-top">
                          <div className="space-y-0.5 text-xs">
                            <p className="font-semibold text-foreground">
                              {t('products.soldItems', {
                                count: item.performance?.soldCount ?? 0,
                              })}
                            </p>
                            <p className="text-muted-foreground">
                              {t('products.viewsLabel', {
                                count: (
                                  item.performance?.viewCount ?? 0
                                ).toLocaleString('vi-VN'),
                              })}
                            </p>
                            <p className="text-muted-foreground">
                              {t('products.revenueLabel', {
                                amount: formatCurrencyVND(
                                  item.performance?.revenue ?? 0,
                                ),
                              })}
                            </p>
                          </div>
                        </td>

                        {/* Col 3: Trạng thái (Green/Amber/Red dot + Label + Update time) */}
                        <td className="px-3 py-3.5 align-top">
                          <div className="space-y-1">
                            {renderStatusDotAndLabel(item.status)}
                            <p className="text-[11px] text-muted-foreground">
                              {formatTikTokUpdateTime(item.updatedAt, locale)}
                            </p>
                            {item.attentionReason ? (
                              <div className="inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span className="line-clamp-1">
                                  {item.attentionReason}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {/* Col 4: Hàng có sẵn (Total stock + Hover Pencil icon to QuickEditStockDialog) */}
                        <td className="px-3 py-3.5 align-top">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'font-mono text-xs font-semibold',
                                item.totalStock === 0
                                  ? 'text-destructive'
                                  : 'text-foreground',
                              )}
                            >
                              {item.totalStock}
                            </span>

                            <PermissionGate permission={PERMISSIONS.PRODUCTS_MANAGE}>
                              <button
                                type="button"
                                onClick={() => setStockModalProduct(item)}
                                className="rounded p-1 text-muted-foreground opacity-70 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                                title={t('products.quickStockTitle')}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </PermissionGate>
                          </div>
                          {item.outOfStockSkuCount > 0 ? (
                            <p className="mt-0.5 text-[10px] font-medium text-destructive">
                              {item.outOfStockSkuCount} SKU hết hàng
                            </p>
                          ) : null}
                        </td>

                        {/* Col 5: Giá bán lẻ (69.000₫ - 299.000₫ + Pencil icon + Khuyến mãi: 51.750₫ - 224.250₫) */}
                        <td className="px-3 py-3.5 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-foreground">
                                {formatPriceRange(
                                  item.minOriginalPrice,
                                  item.maxOriginalPrice,
                                )}
                              </span>
                              <PermissionGate permission={PERMISSIONS.PRODUCTS_MANAGE}>
                                <button
                                  type="button"
                                  onClick={() => setPriceModalProduct(item)}
                                  className="rounded p-1 text-muted-foreground opacity-70 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                                  title={t('products.quickPriceTitle')}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              </PermissionGate>
                            </div>

                            <p className="text-[11px] text-muted-foreground">
                              {t('products.promoPrefix')}{' '}
                              <span className="font-mono font-medium text-foreground dark:text-primary">
                                {formatPriceRange(item.minPrice, item.maxPrice)}
                              </span>
                            </p>
                          </div>
                        </td>

                        {/* Col 6: Hành động (Square Edit button + Square More "..." menu) */}
                        <td className="px-4 py-3.5 text-right align-top">
                          <div className="relative inline-flex items-center justify-end gap-1.5">
                            <PermissionGate permission={PERMISSIONS.PRODUCTS_MANAGE}>
                              <button
                                type="button"
                                onClick={() => setEditingProduct(item)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted"
                                title={t('products.editProductTitle')}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuProductId((prev) =>
                                    prev === item.id ? null : item.id,
                                  )
                                }
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted"
                                title={t('app.actions')}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </PermissionGate>

                            {/* Quick Action Dropdown Menu */}
                            {openMenuProductId === item.id ? (
                              <div
                                onMouseLeave={() => setOpenMenuProductId(null)}
                                className="absolute right-0 top-8 z-30 w-48 rounded-lg border border-border bg-card p-1 text-left text-xs shadow-lg"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuProductId(null);
                                    setStockModalProduct(item);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-muted"
                                >
                                  <span>Sửa Hàng có sẵn (SKU)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuProductId(null);
                                    setPriceModalProduct(item);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-muted"
                                >
                                  <span>Sửa Giá bán lẻ / Khuyến mãi</span>
                                </button>
                                <div className="my-1 border-t border-border" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuProductId(null);
                                    updateStatusMutation.mutate({
                                      id: item.id,
                                      status: 'ACTIVE',
                                    });
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-emerald-600 hover:bg-muted dark:text-emerald-400"
                                >
                                  <span>Đưa lên kệ (ACTIVE)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuProductId(null);
                                    updateStatusMutation.mutate({
                                      id: item.id,
                                      status: 'PENDING',
                                    });
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-muted"
                                >
                                  <span>Chuyển Đang xem xét</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuProductId(null);
                                    updateStatusMutation.mutate({
                                      id: item.id,
                                      status: 'INACTIVE',
                                    });
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-muted"
                                >
                                  <span>Vô hiệu hóa (INACTIVE)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuProductId(null);
                                    updateStatusMutation.mutate({
                                      id: item.id,
                                      status: 'DRAFT',
                                    });
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-muted"
                                >
                                  <span>Chuyển Bản nháp (DRAFT)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuProductId(null);
                                    updateStatusMutation.mutate({
                                      id: item.id,
                                      status: 'DELETED',
                                    });
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-destructive hover:bg-destructive/10"
                                >
                                  <span>Xóa sản phẩm (DELETED)</span>
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable SKU Sub-Row (tr.core-table-expand-content in test.md lines 173-183) */}
                      <tr className="bg-muted/15">
                        <td className="px-4 py-1.5" />
                        <td colSpan={6} className="px-3 py-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-medium text-muted-foreground">
                              {item.skuCount} SKU
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleExpandSku(item.id)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            >
                              <span>
                                {isExpanded
                                  ? t('products.skuCollapse')
                                  : t('products.skuExpand')}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Expanded SKU Table */}
                          {isExpanded ? (
                            <div className="my-2 overflow-hidden rounded-lg border border-border bg-card">
                              <table className="w-full text-left text-xs">
                                <thead className="border-b border-border bg-muted/50 font-display text-[10px] uppercase text-muted-foreground">
                                  <tr>
                                    <th className="px-3 py-2">
                                      Phân loại SKU (sales_attributes)
                                    </th>
                                    <th className="px-3 py-2">Seller SKU</th>
                                    <th className="px-3 py-2">SKU ID</th>
                                    <th className="px-3 py-2 text-right">
                                      Hàng có sẵn
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                      Giá bán lẻ
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                      Khuyến mãi
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {item.skus.map((sku) => {
                                    const attrName =
                                      sku.salesAttributes
                                        ?.map(
                                          (a) => `${a.name}: ${a.value_name}`,
                                        )
                                        .join(' • ') || sku.sellerSku;
                                    return (
                                      <tr
                                        key={sku.id}
                                        className="hover:bg-muted/20"
                                      >
                                        <td className="px-3 py-2 font-medium text-foreground">
                                          {attrName}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-muted-foreground">
                                          {sku.sellerSku}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                                          {sku.externalSkuId ||
                                            sku.id.slice(0, 10)}
                                        </td>
                                        <td
                                          className={cn(
                                            'px-3 py-2 text-right font-mono font-semibold',
                                            sku.stockQuantity === 0
                                              ? 'text-destructive'
                                              : 'text-foreground',
                                          )}
                                        >
                                          {sku.stockQuantity}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono text-muted-foreground line-through">
                                          {formatCurrencyVND(sku.originalPrice)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono font-semibold text-foreground dark:text-primary">
                                          {formatCurrencyVND(sku.salePrice)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Footer (test.md lines 186-209: Tổng số hàng: N | < 1 > | 20/Trang) */}
        <Pagination
          page={meta?.page || urlPage}
          totalPages={meta?.totalPages || 1}
          total={meta?.total || 0}
          limit={meta?.limit || urlLimit}
          onPageChange={(nextPage) => updateUrlParams({ page: nextPage })}
          onLimitChange={(nextLimit) =>
            updateUrlParams({ limit: nextLimit, page: 1 })
          }
          className="rounded-none border-x-0 border-b-0 bg-muted/10 shadow-none"
        />
      </div>

      {/* Modals */}
      <ProductFilterDrawer
        open={showFilterDrawer}
        onOpenChange={setShowFilterDrawer}
        values={{
          categoryId: urlCategory,
          tag: urlTag,
          platform: urlPlatform,
          stockState: urlStockState,
          minPrice: urlMinPrice,
          maxPrice: urlMaxPrice,
          hasDiscount: urlHasDiscount,
        }}
        categories={categories}
        tags={stats?.tags || []}
        onApply={(next) => {
          updateUrlParams({
            categoryId: next.categoryId || undefined,
            tag: next.tag || undefined,
            platform: next.platform || undefined,
            stockState: next.stockState !== 'all' ? next.stockState : undefined,
            minPrice: next.minPrice || undefined,
            maxPrice: next.maxPrice || undefined,
            hasDiscount: next.hasDiscount ? 'true' : undefined,
            page: 1,
          });
        }}
        onReset={() => {
          updateUrlParams({
            categoryId: undefined,
            tag: undefined,
            platform: undefined,
            stockState: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            hasDiscount: undefined,
            page: 1,
          });
        }}
      />

      <CreateProductDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        leafCategories={leafCategories}
      />

      <EditProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
        leafCategories={leafCategories}
      />

      <QuickEditStockDialog
        product={stockModalProduct}
        open={!!stockModalProduct}
        onOpenChange={(open) => {
          if (!open) setStockModalProduct(null);
        }}
      />

      <QuickEditPriceDialog
        product={priceModalProduct}
        open={!!priceModalProduct}
        onOpenChange={(open) => {
          if (!open) setPriceModalProduct(null);
        }}
      />
    </div>
  );
}
