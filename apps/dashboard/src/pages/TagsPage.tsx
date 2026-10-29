import isEmpty from 'lodash/isEmpty';
import {
  Check,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductTagSummary } from '../api/types/catalog.types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { CatalogSubNav } from '../features/catalog/components/CatalogSubNav';
import {
  useCategories,
  useCreateOrAttachTag,
  useDeleteProductTag,
  useProductStats,
  useProductTags,
  useRenameProductTag,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';

export function TagsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const { data: stats } = useProductStats();
  const { data: categories = [] } = useCategories();
  const { data: tags = [], isLoading } = useProductTags();

  const createTagMutation = useCreateOrAttachTag();
  const renameTagMutation = useRenameProductTag();
  const deleteTagMutation = useDeleteProductTag();

  const [newTagName, setNewTagName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCreateTag = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newTagName.trim();
    if (isEmpty(trimmed)) return;
    await createTagMutation.mutateAsync({ name: trimmed });
    setNewTagName('');
  };

  const handleConfirmRename = async (oldName: string) => {
    const trimmed = editingValue.trim();
    if (isEmpty(trimmed) || trimmed === oldName) {
      setEditingTag(null);
      return;
    }
    await renameTagMutation.mutateAsync({ name: oldName, newName: trimmed });
    setEditingTag(null);
  };

  const filteredTags = tags.filter((item) =>
    item.name.toLowerCase().includes(searchFilter.trim().toLowerCase()),
  );

  const columns: Column<ProductTagSummary>[] = [
    {
      key: 'name',
      header: t('tags.colName'),
      render: (item) =>
        editingTag === item.name ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="h-8 w-52 text-xs"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleConfirmRename(item.name)}
              disabled={renameTagMutation.isPending}
              className="h-8 px-2.5"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingTag(null)}
              className="h-8 px-2"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground dark:text-primary">
              <Tag className="h-3.5 w-3.5" />
              <span>{item.name}</span>
            </span>
          </div>
        ),
    },
    {
      key: 'count',
      header: t('tags.colCount'),
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {item.count} sản phẩm
        </span>
      ),
    },
    {
      key: 'filterLink',
      header: t('tags.viewProducts'),
      render: (item) => (
        <button
          type="button"
          onClick={() =>
            navigate(`/products?tag=${encodeURIComponent(item.name)}`)
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
        >
          <span>Lọc trên trang Sản phẩm</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </button>
      ),
    },
    {
      key: 'actions',
      header: t('app.actions'),
      render: (item) => (
        <PermissionGate permission="products.manage">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingTag(item.name);
                setEditingValue(item.name);
              }}
              className="h-8 text-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>{t('tags.renameBtn')}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleteTagMutation.isPending}
              onClick={() => deleteTagMutation.mutate(item.name)}
              className="h-8 text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t('tags.deleteBtn')}</span>
            </Button>
          </div>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <CatalogSubNav
        productCount={stats?.total}
        categoryCount={categories.length}
        tagCount={tags.length}
      />

      <PageHeader
        subtitle={t('tags.subtitle')}
        title={t('tags.title')}
        description={t('tags.desc')}
      />

      <div className="filter-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Tìm kiếm thẻ..."
            className="pl-9 text-xs"
          />
        </div>

        <PermissionGate permission="products.manage">
          <form
            onSubmit={handleCreateTag}
            className="flex flex-1 items-center gap-2 sm:max-w-md"
          >
            <Input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder={t('tags.inputPlaceholder')}
              className="text-xs"
            />
            <Button
              type="submit"
              disabled={
                createTagMutation.isPending || isEmpty(newTagName.trim())
              }
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{t('tags.addBtn')}</span>
            </Button>
          </form>
        </PermissionGate>
      </div>

      <ResponsiveTable
        columns={columns}
        data={filteredTags}
        keyExtractor={(item) => item.name}
        isLoading={isLoading}
      />
    </div>
  );
}

