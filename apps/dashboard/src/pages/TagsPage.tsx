import { isEmpty, trim } from 'lodash';
import {
  ExternalLink,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductTagSummary, TagSortField } from '../api/types/catalog.types';
import { SortOrder } from '../api/types/user.types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Pagination } from '../components/ui/pagination';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { CatalogSubNav } from '../features/catalog/components/CatalogSubNav';
import {
  CreateTagDialog,
  DeleteTagDialog,
  EditTagDialog,
} from '../features/catalog/components/TagDialogs';
import {
  useCategories,
  usePaginatedProductTags,
  useProductStats,
  useProductTags,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { buildCleanSearchParams } from '../lib/utils';

const TAGS_PER_PAGE = 10;

export function TagsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { hasAnyRole, hasPermission } = useAuthContext();

  // Chỉ Admin (SUPER_ADMIN) và Manager (STORE_MANAGER) mới có quyền thêm, sửa, xóa thẻ sản phẩm
  const canManageTags =
    hasAnyRole(ADMIN_MANAGER_ROLES) &&
    hasPermission(PERMISSIONS.PRODUCTS_MANAGE);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const pageParam = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limitParam = Math.min(
    50,
    Math.max(10, Number(searchParams.get('limit')) || TAGS_PER_PAGE),
  );
  const sortBy = (searchParams.get('sortBy') as TagSortField) || 'name';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'asc';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTag, setEditingTag] = useState<ProductTagSummary | null>(null);
  const [deletingTag, setDeletingTag] = useState<ProductTagSummary | null>(
    null,
  );

  // Đồng bộ từ khóa tìm kiếm sau khi debounce 400ms lên URL query params & đưa về trang 1
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || '';
    const cleanedDebounced = trim(debouncedSearch);
    if (cleanedDebounced !== currentUrlSearch) {
      const nextParams = buildCleanSearchParams(
        {
          search: cleanedDebounced,
          sortBy,
          sortOrder,
          page: 1,
          limit: limitParam,
        },
        {
          sortBy: 'name',
          sortOrder: 'asc',
          limit: TAGS_PER_PAGE,
        },
      );
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    debouncedSearch,
    limitParam,
    searchParams,
    setSearchParams,
    sortBy,
    sortOrder,
  ]);

  const updateUrlParams = (
    overrides: Partial<{
      page: number;
      limit: number;
      sortBy: TagSortField;
      sortOrder: SortOrder;
    }>,
  ) => {
    const nextParams = buildCleanSearchParams(
      {
        search: trim(debouncedSearch),
        sortBy: overrides.sortBy ?? sortBy,
        sortOrder: overrides.sortOrder ?? sortOrder,
        page: overrides.page ?? pageParam,
        limit: overrides.limit ?? limitParam,
      },
      {
        sortBy: 'name',
        sortOrder: 'asc',
        limit: TAGS_PER_PAGE,
      },
    );
    setSearchParams(nextParams);
  };

  const { data: stats } = useProductStats();
  const { data: categories = [] } = useCategories();
  const { data: allTags = [] } = useProductTags();
  const {
    data: paginatedResponse,
    isLoading,
    isFetching,
  } = usePaginatedProductTags({
    page: pageParam,
    limit: limitParam,
    search: !isEmpty(trim(debouncedSearch)) ? trim(debouncedSearch) : undefined,
    sortBy,
    sortOrder,
  });

  const handleSortChange = (clickedKey: string) => {
    const field = clickedKey as TagSortField;
    const nextOrder: SortOrder =
      sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    updateUrlParams({ sortBy: field, sortOrder: nextOrder, page: 1 });
  };

  const isSearching =
    isFetching || trim(searchInput) !== trim(debouncedSearch);

  const columns: Column<ProductTagSummary>[] = [
    {
      key: 'name',
      header: t('tags.colName'),
      sortKey: 'name',
      isPrimary: true,
      render: (item) => (
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
      sortKey: 'count',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {t('tags.productCountUnit', { count: item.count })}
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
          <span>{t('tags.filterLinkBtn')}</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </button>
      ),
    },
    {
      key: 'actions',
      header: t('app.actions'),
      render: (item) =>
        canManageTags ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setEditingTag(item)}
              title={t('tags.editTooltip')}
            >
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setDeletingTag(item)}
              title={t('tags.deleteTooltip')}
            >
              <Trash2 className="h-4 w-4 text-rose-500 hover:text-rose-600 dark:text-rose-400" />
            </Button>
          </div>
        ) : (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
            title={t('tags.onlyAdminManagerDesc')}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{t('tags.onlyAdminManager')}</span>
          </span>
        ),
    },
  ];

  const tagsData = paginatedResponse?.data || [];
  const meta = paginatedResponse?.meta;

  return (
    <div className="space-y-5">
      <CatalogSubNav
        productCount={stats?.total}
        categoryCount={categories.length}
        tagCount={allTags.length || meta?.total}
      />

      <PageHeader
        subtitle={t('tags.subtitle')}
        title={t('tags.title')}
        description={t('tags.desc')}
        actions={
          <PermissionGate
            roles={ADMIN_MANAGER_ROLES}
            permission={PERMISSIONS.PRODUCTS_MANAGE}
          >
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              <span>{t('tags.addBtn')}</span>
            </Button>
          </PermissionGate>
        }
      />

      {/* Thanh tìm kiếm thẻ có Debounce 400ms */}
      <div className="filter-panel flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('tags.searchPlaceholder')}
            className="pl-9 pr-9"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-foreground dark:text-primary" />
          ) : !isEmpty(searchInput) ? (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <ResponsiveTable
        columns={columns}
        data={tagsData}
        keyExtractor={(item) => item.name}
        isLoading={isLoading}
        isFetching={isSearching}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      <Pagination
        page={meta?.page || pageParam}
        totalPages={meta?.totalPages || 1}
        total={meta?.total || 0}
        limit={meta?.limit || limitParam}
        onPageChange={(nextPage) => updateUrlParams({ page: nextPage })}
        onLimitChange={(nextLimit) =>
          updateUrlParams({ limit: nextLimit, page: 1 })
        }
      />

      <CreateTagDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <EditTagDialog
        tag={editingTag}
        open={Boolean(editingTag)}
        onOpenChange={(open) => {
          if (!open) setEditingTag(null);
        }}
      />

      <DeleteTagDialog
        tag={deletingTag}
        open={Boolean(deletingTag)}
        onOpenChange={(open) => {
          if (!open) setDeletingTag(null);
        }}
      />
    </div>
  );
}
