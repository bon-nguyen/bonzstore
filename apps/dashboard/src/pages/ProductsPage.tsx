import {
  Boxes,
  CheckCircle2,
  CloudDownload,
  Package,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
  ProductItem,
  ProductStatus,
  SourcePlatform,
} from '../api/types/catalog.types';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import {
  useCategories,
  useCreateProduct,
  useImportPlatformProduct,
  useProducts,
  useProductStats,
  useUpdateProductStatus,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatusBadge } from '../features/shared/StatusBadge';

export function ProductsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<SourcePlatform | ''>('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: stats } = useProductStats();
  const { data: categories } = useCategories();
  const { data: productsRes, isLoading } = useProducts({
    search: search || undefined,
    sourcePlatform: platformFilter || undefined,
    status: statusFilter || undefined,
  });

  const importMutation = useImportPlatformProduct();
  const createMutation = useCreateProduct();
  const updateStatusMutation = useUpdateProductStatus();

  const leafCategories = categories?.filter((c) => c.isLeaf) || [];

  const [formState, setFormState] = useState({
    title: '',
    categoryId: '',
    brandName: 'Good Smile Company',
    sellerSku: 'ANIME-FIG-01',
    originalPrice: 1250000,
    salePrice: 950000,
    stockQuantity: 30,
  });

  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault();
    const targetCategoryId = formState.categoryId || leafCategories[0]?.id;
    if (!targetCategoryId) return;

    await createMutation.mutateAsync({
      ...formState,
      categoryId: targetCategoryId,
    });
    setShowCreateModal(false);
    setFormState({
      title: '',
      categoryId: '',
      brandName: 'Good Smile Company',
      sellerSku: 'ANIME-FIG-01',
      originalPrice: 1250000,
      salePrice: 950000,
      stockQuantity: 30,
    });
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const columns: Column<ProductItem>[] = [
    {
      key: 'product',
      header: 'Anime Product (SPU)',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="h-11 w-11 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="stat-card-icon h-11 w-11">
              <Package className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {item.externalProductId
                ? `Platform ID: ${item.externalProductId}`
                : `Brand: ${item.brandName || 'BonzAnime'}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Leaf Category (202405)',
      render: (item) => (
        <div className="text-xs">
          <p className="font-medium text-foreground">
            {item.category?.localName || '—'}
          </p>
          <p className="font-mono text-foreground/70 dark:text-primary">
            #{item.category?.externalCategoryId || 'LOCAL'}
          </p>
        </div>
      ),
    },
    {
      key: 'sourcePlatform',
      header: 'Platform Source',
      render: (item) => {
        const colors: Record<SourcePlatform, string> = {
          TIKTOK_SHOP: 'status-active',
          SHOPEE: 'status-maintenance',
          LOCAL: 'bg-muted text-foreground',
        };
        return (
          <span className={`status-badge font-display ${colors[item.sourcePlatform]}`}>
            {item.sourcePlatform}
          </span>
        );
      },
    },
    {
      key: 'priceAndStock',
      header: 'Sale Price & SKU Stock',
      render: (item) => (
        <div className="text-xs">
          <p className="font-display font-bold text-foreground dark:text-primary">
            {formatVND(item.minPrice)}
          </p>
          <p className="text-muted-foreground">
            {item.totalStock} pcs ({item.skuCount} SKU)
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('app.status'),
      render: (item) => (
        <PermissionGate
          permission="products.manage"
          fallback={<StatusBadge status={item.status} />}
        >
          <select
            value={item.status}
            onChange={(e) =>
              updateStatusMutation.mutate({
                id: item.id,
                status: e.target.value as ProductStatus,
              })
            }
            className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="FREEZE">FREEZE</option>
          </select>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle={t('products.subtitle')}
        title={t('products.title')}
        description={t('products.desc')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PermissionGate permission="products.sync">
              <button
                type="button"
                disabled={importMutation.isPending}
                onClick={() =>
                  importMutation.mutate({ platform: 'TIKTOK_SHOP' })
                }
                className="action-btn-secondary"
              >
                <CloudDownload className="h-4 w-4" />
                <span>{t('products.copyTiktok')}</span>
              </button>

              <button
                type="button"
                disabled={importMutation.isPending}
                onClick={() => importMutation.mutate({ platform: 'SHOPEE' })}
                className="action-btn-secondary"
              >
                <RefreshCw className="h-4 w-4" />
                <span>{t('products.copyShopee')}</span>
              </button>
            </PermissionGate>

            <PermissionGate permission="products.manage">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="action-btn-primary"
              >
                <Plus className="h-4 w-4" />
                <span>{t('products.addBtn')}</span>
              </button>
            </PermissionGate>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase text-muted-foreground">
              {t('products.statTotal')}
            </p>
            <p className="mt-1 font-display text-2xl font-bold">
              {stats?.total ?? '—'}
            </p>
          </div>
          <div className="stat-card-icon">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase text-muted-foreground">
              {t('products.statActive')}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground dark:text-primary">
              {stats?.active ?? '—'}
            </p>
          </div>
          <div className="stat-card-icon">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase text-muted-foreground">
              {t('products.statSynced')}
            </p>
            <p className="mt-1 font-display text-2xl font-bold">
              {stats?.syncedFromPlatform ?? '—'}
            </p>
          </div>
          <div className="stat-card-icon">
            <CloudDownload className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase text-muted-foreground">
              {t('products.statStock')}
            </p>
            <p className="mt-1 font-display text-2xl font-bold">
              {stats?.totalStock ?? '—'}
            </p>
          </div>
          <div className="stat-card-icon">
            <Boxes className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="filter-panel flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('products.searchPlaceholder')}
          className="flex-1 rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm outline-none focus:border-primary"
        />

        <select
          value={platformFilter}
          onChange={(e) =>
            setPlatformFilter(e.target.value as SourcePlatform | '')
          }
          className="rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">{t('products.allPlatforms')}</option>
          <option value="TIKTOK_SHOP">TikTok Shop (Synced)</option>
          <option value="SHOPEE">Shopee (Synced)</option>
          <option value="LOCAL">BonzStore Web (LOCAL)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
          className="rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">{t('users.allStatus')}</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="DRAFT">DRAFT</option>
        </select>
      </div>

      <ResponsiveTable
        columns={columns}
        data={productsRes?.data || []}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
      />

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="stat-card w-full max-w-md space-y-4 p-6">
            <h2 className="font-display text-lg font-bold">
              {t('products.addBtn')}
            </h2>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Anime Product Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Mô hình Figure Luffy Gear 5 Nika 28cm"
                  value={formState.title}
                  onChange={(e) =>
                    setFormState({ ...formState, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Leaf Category (is_leaf = true)
                </label>
                <select
                  value={formState.categoryId || leafCategories[0]?.id || ''}
                  onChange={(e) =>
                    setFormState({ ...formState, categoryId: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  {leafCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.localName} (#{c.externalCategoryId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Seller SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.sellerSku}
                    onChange={(e) =>
                      setFormState({ ...formState, sellerSku: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={formState.stockQuantity}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Original Price (VND)
                  </label>
                  <input
                    type="number"
                    required
                    value={formState.originalPrice}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        originalPrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Sale Price (VND)
                  </label>
                  <input
                    type="number"
                    required
                    value={formState.salePrice}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        salePrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="action-btn-secondary"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="action-btn-primary"
                >
                  {t('app.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
