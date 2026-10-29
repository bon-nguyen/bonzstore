import { isEmpty, trim } from 'lodash';
import {
  Code2,
  ExternalLink,
  FolderTree,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CategoryItem,
  CategorySortField,
} from '../api/types/catalog.types';
import { SortOrder } from '../api/types/user.types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Pagination } from '../components/ui/pagination';
import { Select } from '../components/ui/select';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { CatalogSubNav } from '../features/catalog/components/CatalogSubNav';
import { CreateCategoryDialog } from '../features/catalog/components/CreateCategoryDialog';
import { DeleteCategoryDialog } from '../features/catalog/components/DeleteCategoryDialog';
import { EditCategoryDialog } from '../features/catalog/components/EditCategoryDialog';
import { TikTokAssetsPreview } from '../features/catalog/components/TikTokAssetsPreview';
import {
  useCategories,
  usePaginatedCategories,
  useProductStats,
  useTikTokCategoryAssets,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatusBadge } from '../features/shared/StatusBadge';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { buildCleanSearchParams } from '../lib/utils';

const CATEGORIES_PER_PAGE = 10;

export function CategoriesPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { hasAnyRole, hasPermission } = useAuthContext();

  // Chỉ Admin (SUPER_ADMIN) và Manager (STORE_MANAGER) mới có quyền thêm, sửa, xóa danh mục
  const canManageCategories =
    hasAnyRole(ADMIN_MANAGER_ROLES) &&
    hasPermission(PERMISSIONS.PRODUCTS_MANAGE);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const pageParam = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limitParam = Math.min(
    50,
    Math.max(10, Number(searchParams.get('limit')) || CATEGORIES_PER_PAGE),
  );
  const statusFilter =
    (searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | '') || '';
  const sortBy =
    (searchParams.get('sortBy') as CategorySortField) || 'localName';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'asc';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null,
  );

  // Đồng bộ từ khóa tìm kiếm sau khi debounce lên URL query params & đưa về trang 1
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || '';
    const cleanedDebounced = trim(debouncedSearch);
    if (cleanedDebounced !== currentUrlSearch) {
      const nextParams = buildCleanSearchParams(
        {
          search: cleanedDebounced,
          status: statusFilter,
          sortBy,
          sortOrder,
          page: 1,
          limit: limitParam,
        },
        {
          sortBy: 'localName',
          sortOrder: 'asc',
          limit: CATEGORIES_PER_PAGE,
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
    statusFilter,
  ]);

  const updateUrlParams = (
    overrides: Partial<{
      page: number;
      limit: number;
      status: 'ACTIVE' | 'INACTIVE' | '';
      sortBy: CategorySortField;
      sortOrder: SortOrder;
    }>,
  ) => {
    const nextParams = buildCleanSearchParams(
      {
        search: trim(debouncedSearch),
        status: overrides.status ?? statusFilter,
        sortBy: overrides.sortBy ?? sortBy,
        sortOrder: overrides.sortOrder ?? sortOrder,
        page: overrides.page ?? pageParam,
        limit: overrides.limit ?? limitParam,
      },
      {
        sortBy: 'localName',
        sortOrder: 'asc',
        limit: CATEGORIES_PER_PAGE,
      },
    );
    setSearchParams(nextParams);
  };

  const { data: allCategories = [] } = useCategories();
  const {
    data: paginatedResponse,
    isLoading,
    isFetching,
  } = usePaginatedCategories({
    page: pageParam,
    limit: limitParam,
    search: !isEmpty(trim(debouncedSearch)) ? trim(debouncedSearch) : undefined,
    status: !isEmpty(statusFilter) ? statusFilter : undefined,
    sortBy,
    sortOrder,
  });

  const { data: stats } = useProductStats();
  const { data: tiktokAssets } = useTikTokCategoryAssets();

  const handleSortChange = (clickedKey: string) => {
    const field = clickedKey as CategorySortField;
    const nextOrder: SortOrder =
      sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    updateUrlParams({ sortBy: field, sortOrder: nextOrder, page: 1 });
  };

  const isSearching =
    isFetching || trim(searchInput) !== trim(debouncedSearch);

  const statusOptions = [
    { value: 'ACTIVE', label: `ACTIVE (${t('status.ACTIVE')})` },
    { value: 'INACTIVE', label: `INACTIVE (${t('status.INACTIVE')})` },
  ];

  const columns: Column<CategoryItem>[] = [
    {
      key: 'localName',
      header: t('categories.colLocalName'),
      sortKey: 'localName',
      isPrimary: true,
      render: (item) => {
        const isChild = item.level > 1;
        const displayName =
          locale === 'en'
            ? item.localNameEn || item.localName
            : item.localNameVi || item.localName;
        const displayParentName =
          locale === 'en'
            ? item.parentNameEn || item.parentName
            : item.parentNameVi || item.parentName;
        return (
          <div
            className={
              isChild
                ? 'ml-4 border-l-2 border-primary/40 pl-3 py-0.5 space-y-0.5'
                : 'space-y-0.5'
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              {!isChild ? (
                <FolderTree className="h-3.5 w-3.5 shrink-0 text-foreground dark:text-primary" />
              ) : null}
              <span
                className={
                  isChild
                    ? 'font-medium text-foreground'
                    : 'font-display font-bold text-foreground dark:text-primary'
                }
              >
                {isChild ? '↳ ' : ''}
                {displayName}
              </span>
              {!isChild && item.childrenCount > 0 ? (
                <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground dark:text-primary">
                  {t('categories.childrenCountBadge', {
                    count: item.childrenCount,
                  })}
                </span>
              ) : null}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">
              cipher: TTP_VN_CAT_ASSET_
              {item.externalCategoryId || item.id.slice(0, 6)}_202405
            </p>
            {isChild && displayParentName ? (
              <p className="text-[10px] text-muted-foreground">
                {t('categories.childOfPrefix')}{' '}
                <span className="font-medium text-foreground">
                  {displayParentName}
                </span>
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'externalCategoryId',
      header: t('categories.colIds'),
      render: (item) => {
        const isRoot =
          !item.externalParentId || item.externalParentId === '0';
        return (
          <div className="space-y-0.5 font-mono text-xs">
            <div>
              <span className="text-muted-foreground">
                {t('categories.idPrefix')}{' '}
              </span>
              <span className="font-semibold text-foreground dark:text-primary">
                {item.externalCategoryId || '—'}
              </span>
            </div>
            <p className="text-muted-foreground">
              <span>{t('categories.parentIdPrefix')} </span>
              <span className="font-medium text-foreground">
                {isRoot
                  ? t('categories.parentRootBadge')
                  : item.externalParentId}
              </span>
            </p>
          </div>
        );
      },
    },
    {
      key: 'isLeaf',
      header: t('categories.colIsLeaf'),
      render: (item) =>
        item.isLeaf ? (
          <span className="status-badge status-active">
            {t('categories.leafTrueBadge')}
          </span>
        ) : (
          <span className="status-badge status-maintenance">
            {t('categories.leafFalseBadge', { level: item.level })}
          </span>
        ),
    },
    {
      key: 'permissionStatuses',
      header: t('categories.colPermissions'),
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
      header: t('categories.colProducts'),
      sortKey: 'productCount',
      render: (item) => (
        <button
          type="button"
          onClick={() => navigate(`/products?categoryId=${item.id}`)}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-foreground transition hover:bg-muted dark:text-primary"
        >
          <span>
            {t('categories.productUnit', { count: item.productCount })}
          </span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </button>
      ),
    },
    {
      key: 'status',
      header: t('categories.colStatus'),
      sortKey: 'status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: t('categories.colActions'),
      render: (item) =>
        canManageCategories ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setEditingCategory(item)}
              title={t('categories.editTooltip')}
            >
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setDeletingCategory(item)}
              title={t('categories.deleteTooltip')}
            >
              <Trash2 className="h-4 w-4 text-rose-500 hover:text-rose-600 dark:text-rose-400" />
            </Button>
          </div>
        ) : (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
            title={t('categories.onlyAdminManagerDesc')}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{t('categories.onlyAdminManager')}</span>
          </span>
        ),
    },
  ];

  const categoriesData = paginatedResponse?.data || [];
  const meta = paginatedResponse?.meta;

  return (
    <div className="space-y-5">
      <CatalogSubNav
        productCount={stats?.total}
        categoryCount={allCategories.length || meta?.total}
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

            <PermissionGate
              roles={ADMIN_MANAGER_ROLES}
              permission={PERMISSIONS.PRODUCTS_MANAGE}
            >
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

      {/* Thanh tìm kiếm có Debounce 400ms & Bộ lọc trạng thái */}
      <div className="filter-panel flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('categories.searchPlaceholder')}
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

        <Select
          value={statusFilter}
          onChange={(e) =>
            updateUrlParams({
              status: e.target.value as 'ACTIVE' | 'INACTIVE' | '',
              page: 1,
            })
          }
          placeholder={t('categories.allStatus')}
          options={statusOptions}
          className="sm:w-52"
        />
      </div>

      <ResponsiveTable
        columns={columns}
        data={categoriesData}
        keyExtractor={(c) => c.id}
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

      <CreateCategoryDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        categories={allCategories}
      />

      <EditCategoryDialog
        category={editingCategory}
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
        categories={allCategories}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      />
    </div>
  );
}
