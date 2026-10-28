import { isEmpty, trim } from 'lodash';
import {
  Eye,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Search,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  UserPlus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SortOrder,
  UserItem,
  UserSortField,
  UserStatus,
} from '../api/types/user.types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Pagination } from '../components/ui/pagination';
import { Select } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { TranslationKey, useI18n } from '../features/i18n/I18nContext';
import { useRoles } from '../features/roles/hooks/useRoles';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatusBadge } from '../features/shared/StatusBadge';
import { CreateUserDialog } from '../features/users/components/CreateUserDialog';
import { EditUserDialog } from '../features/users/components/EditUserDialog';
import { ResetPasswordDialog } from '../features/users/components/ResetPasswordDialog';
import { UserDetailDialog } from '../features/users/components/UserDetailDialog';
import { useUpdateUser, useUsers } from '../features/users/hooks/useUsers';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { buildCleanSearchParams, canActorManageRole } from '../lib/utils';

const MAX_USERS_PER_PAGE = 20;

const ROLE_TABS: Array<{ labelKey: TranslationKey; roleCode: string }> = [
  { labelKey: 'users.tabAll', roleCode: 'ALL' },
  { labelKey: 'users.tabAdmin', roleCode: 'SUPER_ADMIN' },
  { labelKey: 'users.tabManager', roleCode: 'STORE_MANAGER' },
  { labelKey: 'users.tabStaff', roleCode: 'STAFF' },
  { labelKey: 'users.tabCustomer', roleCode: 'CUSTOMER' },
];

const USER_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE (Hoạt động)' },
  { value: 'LOCKED', label: 'LOCKED (Đã khóa)' },
  { value: 'INACTIVE', label: 'INACTIVE (Đã ẩn)' },
];

export function UsersPage() {
  const { t } = useI18n();
  const { user: currentUser } = useAuthContext();
  const actorRoleCode = currentUser?.role?.code;
  const isSuperAdmin = actorRoleCode === 'SUPER_ADMIN';

  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc state khởi tạo từ URL query params (http://localhost:5173/users?...)
  const initialSearch = searchParams.get('search') || '';
  const pageParam = Math.max(Number(searchParams.get('page')) || 1, 1);
  const roleFilter = searchParams.get('roleCode') || 'ALL';
  const statusFilter = (searchParams.get('status') as UserStatus | '') || '';
  const sortBy = (searchParams.get('sortBy') as UserSortField) || 'role';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'asc';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  // State quản lý các Modal (Tạo mới, Xem chi tiết, Chỉnh sửa, Reset mật khẩu)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserItem | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(
    null,
  );

  // Đồng bộ từ khóa sau khi debounce lên URL query params & đưa về trang 1
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || '';
    const cleanedDebounced = trim(debouncedSearch);
    if (cleanedDebounced !== currentUrlSearch) {
      const nextParams = buildCleanSearchParams(
        {
          search: cleanedDebounced,
          roleCode: roleFilter,
          status: statusFilter,
          sortBy,
          sortOrder,
          page: 1,
          limit: MAX_USERS_PER_PAGE,
        },
        {
          roleCode: 'ALL',
          sortBy: 'role',
          sortOrder: 'asc',
        },
      );
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    debouncedSearch,
    roleFilter,
    searchParams,
    setSearchParams,
    sortBy,
    sortOrder,
    statusFilter,
  ]);

  const updateUrlParams = (
    overrides: Partial<{
      page: number;
      roleCode: string;
      status: UserStatus | '';
      sortBy: UserSortField;
      sortOrder: SortOrder;
    }>,
  ) => {
    const nextParams = buildCleanSearchParams(
      {
        search: trim(debouncedSearch),
        roleCode: overrides.roleCode ?? roleFilter,
        status: overrides.status ?? statusFilter,
        sortBy: overrides.sortBy ?? sortBy,
        sortOrder: overrides.sortOrder ?? sortOrder,
        page: overrides.page ?? pageParam,
        limit: MAX_USERS_PER_PAGE,
      },
      {
        roleCode: 'ALL',
        sortBy: 'role',
        sortOrder: 'asc',
      },
    );
    setSearchParams(nextParams);
  };

  const {
    data: usersResponse,
    isLoading,
    isFetching,
  } = useUsers({
    page: pageParam,
    limit: MAX_USERS_PER_PAGE,
    search: !isEmpty(trim(debouncedSearch)) ? trim(debouncedSearch) : undefined,
    status: !isEmpty(statusFilter) ? statusFilter : undefined,
    roleCode: roleFilter !== 'ALL' ? roleFilter : undefined,
    sortBy,
    sortOrder,
  });

  const { data: roles = [] } = useRoles();
  const updateUserMutation = useUpdateUser();

  const handleSortChange = (clickedKey: string) => {
    const field = clickedKey as UserSortField;
    const nextOrder: SortOrder =
      sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    updateUrlParams({ sortBy: field, sortOrder: nextOrder, page: 1 });
  };

  const handleToggleLock = (targetUser: UserItem) => {
    if (!canActorManageRole(actorRoleCode, targetUser.role?.code)) return;
    const nextStatus: UserStatus =
      targetUser.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    updateUserMutation.mutate({
      id: targetUser.id,
      data: { status: nextStatus },
    });
  };

  const handleChangeRole = (targetUser: UserItem, newRoleCode: string) => {
    if (!canActorManageRole(actorRoleCode, targetUser.role?.code)) return;
    if (!canActorManageRole(actorRoleCode, newRoleCode)) return;
    updateUserMutation.mutate({
      id: targetUser.id,
      data: { roleIdOrCode: newRoleCode },
    });
  };

  const assignableRoleOptions = roles
    .filter((r) => canActorManageRole(actorRoleCode, r.code))
    .map((r) => ({
      value: r.code,
      label: `${r.name} (${r.code})`,
    }));

  const isSearching =
    isFetching || trim(searchInput) !== trim(debouncedSearch);

  const columns: Column<UserItem>[] = [
    {
      key: 'user',
      header: t('users.colAccount'),
      sortKey: 'fullName',
      isPrimary: true,
      render: (item) => (
        <div
          className="cursor-pointer group"
          onClick={() => setViewingUser(item)}
          title="Bấm để xem hồ sơ chi tiết"
        >
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-foreground group-hover:underline dark:group-hover:text-primary">
              {item.fullName}
            </p>
            {item.isEmailMasked ? (
              <span
                className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-300"
                title="Email của tài khoản cấp cao hơn (SUPER_ADMIN) đã được mã hóa/hash bảo vệ"
              >
                <ShieldAlert className="h-3 w-3" />
                Hashed
              </span>
            ) : null}
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {item.email}
          </p>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('users.colRole'),
      sortKey: 'role',
      render: (item) => {
        const canManageRow =
          item.canManage !== false &&
          canActorManageRole(actorRoleCode, item.role?.code);

        if (!canManageRow) {
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xs font-bold text-foreground dark:text-primary">
                {item.role?.name} ({item.role?.code})
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Protected
              </span>
            </div>
          );
        }

        return (
          <PermissionGate
            permission="users.update"
            fallback={
              <span className="font-medium text-foreground dark:text-primary">
                {item.role?.name} ({item.role?.code})
              </span>
            }
          >
            <Select
              value={item.role?.code || ''}
              onChange={(e) => handleChangeRole(item, e.target.value)}
              options={assignableRoleOptions}
              className="h-8 w-auto min-w-[165px] text-xs font-medium"
            />
          </PermissionGate>
        );
      },
    },
    {
      key: 'portalAccess',
      header: t('users.colPortal'),
      render: (item) =>
        item.role?.isAdminPanel ? (
          <span className="status-badge status-active">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('users.portalYes')}
          </span>
        ) : (
          <span className="status-badge status-maintenance">
            {t('users.portalNo')}
          </span>
        ),
    },
    {
      key: 'status',
      header: t('app.status'),
      sortKey: 'status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'permissions',
      header: t('users.colPerms'),
      render: (item) => (
        <span className="text-xs font-medium text-muted-foreground">
          {item.permissions?.length || 0} {t('roles.permsCount')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('app.actions'),
      render: (item) => {
        const canManageRow =
          item.canManage !== false &&
          canActorManageRole(actorRoleCode, item.role?.code);

        return (
          <div className="flex items-center gap-1">
            {/* Nút Xem chi tiết (Luôn hiển thị cho người có quyền xem danh sách) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setViewingUser(item)}
              title="Xem thông tin chi tiết"
            >
              <Eye className="h-4 w-4 text-foreground dark:text-primary" />
            </Button>

            {canManageRow ? (
              <PermissionGate permission="users.update">
                {/* Nút Sửa thông tin */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingUser(item)}
                  title="Chỉnh sửa thông tin tài khoản"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>

                {/* Nút Reset Password */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setResetPasswordUser(item)}
                  title="Reset mật khẩu tài khoản"
                >
                  <KeyRound className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                </Button>

                {/* Nút Khóa / Mở khóa */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleLock(item)}
                  title={
                    item.status === 'ACTIVE'
                      ? 'Khóa tài khoản'
                      : 'Mở khóa tài khoản'
                  }
                >
                  {item.status === 'ACTIVE' ? (
                    <Lock className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                  ) : (
                    <Unlock className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  )}
                </Button>
              </PermissionGate>
            ) : (
              <span
                className="ml-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
                title="Chỉ SUPER_ADMIN mới được phép sửa, khóa hoặc reset mật khẩu tài khoản này"
              >
                <Lock className="h-3.5 w-3.5" />
                Chỉ SUPER_ADMIN
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const meta = usersResponse?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle={t('users.subtitle')}
        title={t('users.title')}
        description={
          isSuperAdmin
            ? `${t('users.desc')} — Bạn đang có toàn quyền SUPER_ADMIN.`
            : `${t('users.desc')} — Chế độ ${actorRoleCode}: Các tài khoản cấp cao hơn (SUPER_ADMIN) được mã hóa email và khóa chỉnh sửa.`
        }
        actions={
          <PermissionGate permission="users.create">
            <Button onClick={() => setShowCreateModal(true)}>
              <UserPlus className="h-4 w-4" />
              <span>{t('users.addBtn')}</span>
            </Button>
          </PermissionGate>
        }
      />

      <Tabs
        value={roleFilter}
        onValueChange={(val) => updateUrlParams({ roleCode: val, page: 1 })}
      >
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          {ROLE_TABS.map((tab) => (
            <TabsTrigger key={tab.roleCode} value={tab.roleCode}>
              {t(tab.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="filter-panel flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
            className="pl-9 pr-9"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-foreground dark:text-primary" />
          ) : null}
        </div>

        <Select
          value={statusFilter}
          onChange={(e) =>
            updateUrlParams({
              status: e.target.value as UserStatus | '',
              page: 1,
            })
          }
          placeholder={t('users.allStatus')}
          options={USER_STATUS_OPTIONS}
          className="sm:w-52"
        />
      </div>

      <ResponsiveTable
        columns={columns}
        data={usersResponse?.data || []}
        keyExtractor={(u) => u.id}
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
        limit={meta?.limit || MAX_USERS_PER_PAGE}
        onPageChange={(nextPage) => updateUrlParams({ page: nextPage })}
      />

      {/* Modal 1: Tạo tài khoản mới */}
      <CreateUserDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        roles={roles}
      />

      {/* Modal 2: Xem chi tiết tài khoản */}
      <UserDetailDialog
        user={viewingUser}
        open={Boolean(viewingUser)}
        onOpenChange={(open) => {
          if (!open) setViewingUser(null);
        }}
        onRequestEdit={(target) => setEditingUser(target)}
        onRequestResetPassword={(target) => setResetPasswordUser(target)}
      />

      {/* Modal 3: Chỉnh sửa thông tin tài khoản */}
      <EditUserDialog
        user={editingUser}
        open={Boolean(editingUser)}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
        roles={roles}
      />

      {/* Modal 4: Reset Password */}
      <ResetPasswordDialog
        user={resetPasswordUser}
        open={Boolean(resetPasswordUser)}
        onOpenChange={(open) => {
          if (!open) setResetPasswordUser(null);
        }}
      />
    </div>
  );
}
