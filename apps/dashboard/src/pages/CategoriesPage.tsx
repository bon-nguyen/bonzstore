import { Code2, ExternalLink, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryItem } from '../api/types/catalog.types';
import { Button } from '../components/ui/button';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { CatalogSubNav } from '../features/catalog/components/CatalogSubNav';
import { CreateCategoryDialog } from '../features/catalog/components/CreateCategoryDialog';
import { TikTokAssetsPreview } from '../features/catalog/components/TikTokAssetsPreview';
import {
  useCategories,
  useProductStats,
  useSyncTikTokCategories,
  useTikTokCategoryAssets,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatusBadge } from '../features/shared/StatusBadge';

export function CategoriesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: categories = [], isLoading } = useCategories();
  const { data: stats } = useProductStats();
  const { data: tiktokAssets } = useTikTokCategoryAssets();
  const syncMutation = useSyncTikTokCategories();

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns: Column<CategoryItem>[] = [
    {
      key: 'localName',
      header: 'category.local_name (202405)',
      render: (item) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
              className="font-semibold text-foreground"
            >
              {item.level > 1 ? '↳ ' : ''}
              {item.localName}
            </span>
          </div>
          <p
            style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
            className="font-mono text-[10px] text-muted-foreground"
          >
            cipher: TTP_VN_CAT_ASSET_{item.externalCategoryId || item.id.slice(0, 6)}_202405
          </p>
        </div>
      ),
    },
    {
      key: 'externalCategoryId',
      header: 'category.id / parent_id',
      render: (item) => (
        <div className="font-mono text-xs">
          <span className="font-semibold text-foreground dark:text-primary">
            id: {item.externalCategoryId || '—'}
          </span>
          <p className="text-muted-foreground">
            parent_id: {item.externalParentId || '0'}
          </p>
        </div>
      ),
    },
    {
      key: 'isLeaf',
      header: 'category.is_leaf',
      render: (item) =>
        item.isLeaf ? (
          <span className="status-badge status-active">
            is_leaf: true (SPU)
          </span>
        ) : (
          <span className="status-badge status-maintenance">
            is_leaf: false (L{item.level})
          </span>
        ),
    },
    {
      key: 'permissionStatuses',
      header: 'permission_statuses',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.permissionStatuses.map((status) => (
            <span
              key={status}
              className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground"
            >
              {status}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'productCount',
      header: 'Sản phẩm',
      render: (item) => (
        <button
          type="button"
          onClick={() => navigate(`/products?categoryId=${item.id}`)}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-foreground transition hover:bg-muted dark:text-primary"
        >
          <span>{item.productCount} SP</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </button>
      ),
    },
    {
      key: 'status',
      header: t('app.status'),
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <CatalogSubNav
        productCount={stats?.total}
        categoryCount={categories.length}
        tagCount={stats?.tags?.length}
      />

      <PageHeader
        subtitle={t('categories.subtitle')}
        title={t('categories.title')}
        description={t('categories.desc')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
            >
              <Code2 className="h-4 w-4" />
              <span>
                {showJsonPreview
                  ? t('categories.hideJson')
                  : t('categories.viewJson')}
              </span>
            </Button>

            <PermissionGate permission="products.sync">
              <Button
                variant="outline"
                disabled={syncMutation.isPending}
                onClick={() => syncMutation.mutate()}
              >
                <RefreshCw
                  className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`}
                />
                <span>
                  {syncMutation.isPending
                    ? t('categories.syncing')
                    : t('categories.syncBtn')}
                </span>
              </Button>
            </PermissionGate>

            <PermissionGate permission="products.manage">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4" />
                <span>{t('categories.addBtn')}</span>
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {showJsonPreview && tiktokAssets ? (
        <TikTokAssetsPreview assets={tiktokAssets} />
      ) : null}

      <ResponsiveTable
        columns={columns}
        data={categories}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
      />

      <CreateCategoryDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        categories={categories}
      />
    </div>
  );
}
