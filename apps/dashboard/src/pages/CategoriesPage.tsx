import { Code2, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { CategoryItem } from '../api/types/catalog.types';
import { Button } from '../components/ui/button';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { CreateCategoryDialog } from '../features/catalog/components/CreateCategoryDialog';
import { TikTokAssetsPreview } from '../features/catalog/components/TikTokAssetsPreview';
import {
  useCategories,
  useSyncTikTokCategories,
  useTikTokCategoryAssets,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatusBadge } from '../features/shared/StatusBadge';

export function CategoriesPage() {
  const { t } = useI18n();
  const { data: categories = [], isLoading } = useCategories();
  const { data: tiktokAssets } = useTikTokCategoryAssets();
  const syncMutation = useSyncTikTokCategories();

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns: Column<CategoryItem>[] = [
    {
      key: 'localName',
      header: 'local_name (Anime Category)',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span
            style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
            className="font-semibold text-foreground"
          >
            {item.level > 1 ? '↳ ' : ''}
            {item.localName}
          </span>
        </div>
      ),
    },
    {
      key: 'externalCategoryId',
      header: 'TikTok ID / Parent ID',
      render: (item) => (
        <div className="font-mono text-xs">
          <span className="font-semibold text-foreground dark:text-primary">
            ID: {item.externalCategoryId || '—'}
          </span>
          <p className="text-muted-foreground">
            Parent: {item.externalParentId || '0'}
          </p>
        </div>
      ),
    },
    {
      key: 'isLeaf',
      header: 'is_leaf',
      render: (item) =>
        item.isLeaf ? (
          <span className="status-badge status-active">
            Leaf Category (SPU)
          </span>
        ) : (
          <span className="status-badge status-maintenance">
            Parent (L{item.level})
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
      header: 'Products',
      render: (item) => (
        <span className="text-xs font-medium">{item.productCount} SPU</span>
      ),
    },
    {
      key: 'status',
      header: t('app.status'),
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-6">
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
