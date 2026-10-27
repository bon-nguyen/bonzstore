import { Code2, FolderTree, Plus, RefreshCw } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { CategoryItem } from '../api/types/catalog.types';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import {
  useCategories,
  useCreateCategory,
  useSyncTikTokCategories,
  useTikTokCategoryAssets,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatusBadge } from '../features/shared/StatusBadge';

export function CategoriesPage() {
  const { t } = useI18n();
  const { data: categories, isLoading } = useCategories();
  const { data: tiktokAssets } = useTikTokCategoryAssets();
  const syncMutation = useSyncTikTokCategories();
  const createMutation = useCreateCategory();

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formState, setFormState] = useState({
    localName: '',
    externalCategoryId: '',
    parentId: '',
    isLeaf: true,
  });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      localName: formState.localName,
      externalCategoryId: formState.externalCategoryId || undefined,
      parentId: formState.parentId || undefined,
      isLeaf: formState.isLeaf,
    });
    setShowCreateModal(false);
    setFormState({
      localName: '',
      externalCategoryId: '',
      parentId: '',
      isLeaf: true,
    });
  };

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
            <button
              type="button"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="action-btn-secondary"
            >
              <Code2 className="h-4 w-4" />
              <span>
                {showJsonPreview
                  ? t('categories.hideJson')
                  : t('categories.viewJson')}
              </span>
            </button>

            <PermissionGate permission="products.sync">
              <button
                type="button"
                disabled={syncMutation.isPending}
                onClick={() => syncMutation.mutate()}
                className="action-btn-secondary"
              >
                <RefreshCw
                  className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`}
                />
                <span>
                  {syncMutation.isPending
                    ? t('categories.syncing')
                    : t('categories.syncBtn')}
                </span>
              </button>
            </PermissionGate>

            <PermissionGate permission="products.manage">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="action-btn-primary"
              >
                <Plus className="h-4 w-4" />
                <span>{t('categories.addBtn')}</span>
              </button>
            </PermissionGate>
          </div>
        }
      />

      {showJsonPreview && tiktokAssets ? (
        <div className="stat-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase text-foreground dark:text-primary">
              GET /api/categories/assets (TikTok Shop 202405 Response Envelope)
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              request_id: {tiktokAssets.request_id}
            </span>
          </div>
          <pre className="max-h-72 overflow-auto rounded-lg bg-tiktok p-4 font-mono text-xs text-mint">
            {JSON.stringify(tiktokAssets, null, 2)}
          </pre>
        </div>
      ) : null}

      <ResponsiveTable
        columns={columns}
        data={categories || []}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
      />

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="stat-card w-full max-w-md space-y-4 p-6">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-foreground dark:text-primary" />
              <h2 className="font-display text-lg font-bold">
                {t('categories.addBtn')}
              </h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  local_name (Anime Category)
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Mô hình Nendoroid / Gunpla"
                  value={formState.localName}
                  onChange={(e) =>
                    setFormState({ ...formState, localName: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  externalCategoryId (TikTok / Shopee ID)
                </label>
                <input
                  type="text"
                  placeholder="VD: 605088"
                  value={formState.externalCategoryId}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      externalCategoryId: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Parent Category
                </label>
                <select
                  value={formState.parentId}
                  onChange={(e) =>
                    setFormState({ ...formState, parentId: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <option value="">-- Root Category (parent_id = 0) --</option>
                  {categories
                    ?.filter((c) => !c.isLeaf)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.localName} ({c.externalCategoryId})
                      </option>
                    ))}
                </select>
              </div>
              <label className="flex items-center gap-2 pt-1 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={formState.isLeaf}
                  onChange={(e) =>
                    setFormState({ ...formState, isLeaf: e.target.checked })
                  }
                />
                <span>is_leaf = true (Allow attaching Anime products)</span>
              </label>
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
