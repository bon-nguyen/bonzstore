import {
  Boxes,
  CheckCircle2,
  CloudDownload,
  Package,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import {
  ProductItem,
  ProductStatus,
  SourcePlatform,
} from '../api/types/catalog.types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { CreateProductDialog } from '../features/catalog/components/CreateProductDialog';
import {
  useCategories,
  useImportPlatformProduct,
  useProducts,
  useProductStats,
  useUpdateProductStatus,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatCard } from '../features/shared/StatCard';
import { StatusBadge } from '../features/shared/StatusBadge';
import { formatCurrencyVND } from '../lib/utils';

const PLATFORM_OPTIONS = [
  { value: 'TIKTOK_SHOP', label: 'TikTok Shop (Synced)' },
  { value: 'SHOPEE', label: 'Shopee (Synced)' },
  { value: 'LOCAL', label: 'BonzStore Web (LOCAL)' },
];

const PRODUCT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'FREEZE', label: 'FREEZE' },
];

export function ProductsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<SourcePlatform | ''>('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: stats } = useProductStats();
  const { data: categories = [] } = useCategories();
  const { data: productsRes, isLoading } = useProducts({
    search: search || undefined,
    sourcePlatform: platformFilter || undefined,
    status: statusFilter || undefined,
  });

  const importMutation = useImportPlatformProduct();
  const updateStatusMutation = useUpdateProductStatus();

  const leafCategories = categories.filter((c) => c.isLeaf);

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
          <span
            className={`status-badge font-display ${colors[item.sourcePlatform]}`}
          >
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
            {formatCurrencyVND(item.minPrice)}
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
          <Select
            value={item.status}
            onChange={(e) =>
              updateStatusMutation.mutate({
                id: item.id,
                status: e.target.value as ProductStatus,
              })
            }
            options={PRODUCT_STATUS_OPTIONS}
            className="h-8 w-auto min-w-[115px] text-xs font-medium"
          />
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

            <PermissionGate permission="products.manage">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4" />
                <span>{t('products.addBtn')}</span>
              </Button>
            </PermissionGate>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('products.statTotal')}
          value={stats?.total ?? '—'}
          icon={Package}
        />
        <StatCard
          label={t('products.statActive')}
          value={stats?.active ?? '—'}
          icon={CheckCircle2}
          highlight
        />
        <StatCard
          label={t('products.statSynced')}
          value={stats?.syncedFromPlatform ?? '—'}
          icon={CloudDownload}
        />
        <StatCard
          label={t('products.statStock')}
          value={stats?.totalStock ?? '—'}
          icon={Boxes}
        />
      </div>

      <div className="filter-panel flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('products.searchPlaceholder')}
          className="flex-1"
        />

        <Select
          value={platformFilter}
          onChange={(e) =>
            setPlatformFilter(e.target.value as SourcePlatform | '')
          }
          placeholder={t('products.allPlatforms')}
          options={PLATFORM_OPTIONS}
          className="sm:w-52"
        />

        <Select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ProductStatus | '')
          }
          placeholder={t('users.allStatus')}
          options={PRODUCT_STATUS_OPTIONS.slice(0, 3)}
          className="sm:w-44"
        />
      </div>

      <ResponsiveTable
        columns={columns}
        data={productsRes?.data || []}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
      />

      <CreateProductDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        leafCategories={leafCategories}
      />
    </div>
  );
}
