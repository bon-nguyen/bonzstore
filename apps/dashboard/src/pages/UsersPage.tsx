import { isEmpty, trim } from 'lodash';
import {
  Activity,
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
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
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
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
  ROLES,
} from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { TranslationKey, useI18n } from '../features/i18n/I18nContext';
import { useRoles } from '../features/roles/hooks/useRoles';
import { PageHeader } from '../features/shared/PageHeader';
import { PageSectionContainer } from '../features/shared/PageSectionContainer';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatusBadge } from '../features/shared/StatusBadge';
import { CreateUserDialog } from '../features/users/components/CreateUserDialog';
import { EditUserDialog } from '../features/users/components/EditUserDialog';
import { ResetPasswordDialog } from '../features/users/components/ResetPasswordDialog';
import { UserDetailDialog } from '../features/users/components/UserDetailDialog';
import {
  useUpdateUser,
  useUsers,
  useUserStats,
} from '../features/users/hooks/useUsers';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  buildCleanSearchParams,
  canActorAssignRole,
  canActorManageRole,
} from '../lib/utils';

const MAX_USERS_PER_PAGE = 20;

const ROLE_TABS: Array<{ labelKey: TranslationKey; roleCode: string }> = [
  { labelKey: 'users.tabAll', roleCode: 'ALL' },
  { labelKey: 'users.tabAdmin', roleCode: ROLES.SUPER_ADMIN },
  { labelKey: 'users.tabManager', roleCode: ROLES.STORE_MANAGER },
  { labelKey: 'users.tabStaff', roleCode: ROLES.STAFF },
  { labelKey: 'users.tabCustomer', roleCode: ROLES.CUSTOMER },
];

export function UsersPage() {
  const { t } = useI18n();
  const { user: currentUser, hasAnyRole } = useAuthContext();
  const actorRoleCode = currentUser?.role?.code;
  const isSuperAdmin = actorRoleCode === ROLES.SUPER_ADMIN;
  const canViewUsers = hasAnyRole(ADMIN_MANAGER_ROLES);

  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc state khởi tạo từ URL query params (http://localhost:5173/users?...)
  const initialSearch = searchParams.get('search') || '';
  const pageParam = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limitParam = Math.min(
    50,
    Math.max(10, Number(searchParams.get('limit')) || MAX_USERS_PER_PAGE),
  );
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
          limit: limitParam,
        },
        {
          roleCode: 'ALL',
          sortBy: 'role',
          sortOrder: 'asc',
          limit: MAX_USERS_PER_PAGE,
        },
      );
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    debouncedSearch,
    limitParam,
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
      limit: number;
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
        limit: overrides.limit ?? limitParam,
      },
      {
        roleCode: 'ALL',
        sortBy: 'role',
        sortOrder: 'asc',
        limit: MAX_USERS_PER_PAGE,
      },
    );
    setSearchParams(nextParams);
  };

  const { data: userStats } = useUserStats();
  const {
    data: usersResponse,
    isLoading,
    isFetching,
  } = useUsers({
    page: pageParam,
    limit: limitParam,
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
    if (!canActorAssignRole(actorRoleCode, newRoleCode)) return;
    updateUserMutation.mutate({
      id: targetUser.id,
      data: { roleIdOrCode: newRoleCode },
    });
  };

  // SUPER_ADMIN là duy nhất trong hệ thống nên không bao giờ xuất hiện trong dropdown gán Role
  const assignableRoleOptions = roles
    .filter((r) => canActorAssignRole(actorRoleCode, r.code))
    .map((r) => ({
      value: r.code,
      label: `${r.name} (${r.code})`,
    }));

  const userStatusOptions = [
    { value: 'ACTIVE', label: `ACTIVE (${t('status.ACTIVE')})` },
    { value: 'LOCKED', label: `LOCKED (${t('status.LOCKED')})` },
    { value: 'INACTIVE', label: `INACTIVE (${t('status.INACTIVE')})` },
  ];

  const isSearching =
    isFetching || trim(searchInput) !== trim(debouncedSearch);

  const totalSystemUsers = userStats?.total || usersResponse?.meta?.total || 0;
  const totalRolesCount = userStats?.totalRoles || roles.length || 0;

  const columns: Column<UserItem>[] = [
    {
      key: 'user',
      header: t('users.colAccount'),
      sortKey: 'fullName',
      isPrimary: true,
      render: (item) => (
        <div
          className="group cursor-pointer"
          onClick={() => canViewUsers && setViewingUser(item)}
          title={t('users.viewDetailTooltip')}
        >
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-foreground group-hover:underline dark:group-hover:text-primary">
              {item.fullName}
            </p>
            {item.isEmailMasked ? (
              <span
                className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-300"
                title={t('users.hashedTooltip')}
              >
                <ShieldAlert className="h-3 w-3" />
                {t('users.hashedBadge')}
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
        const isRowSuperAdmin = item.role?.code === ROLES.SUPER_ADMIN;
        const canManageRow =
          item.canManage !== false &&
          canActorManageRole(actorRoleCode, item.role?.code);

        if (isRowSuperAdmin || !canManageRow) {
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xs font-bold text-foreground dark:text-primary">
                {item.role?.name} ({item.role?.code})
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {t('users.protectedBadge')}
              </span>
            </div>
          );
        }

        return (
          <PermissionGate
            permission={PERMISSIONS.USERS_UPDATE}
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
      key: 'roleTotal',
      header: t('users.colRoleTotal'),
      render: (item) => {
        const roleCount =
          item.roleUserCount ??
          (item.role?.code ? userStats?.byRole?.[item.role.code] : 0) ??
          0;
        return (
          <div className="text-xs">
            <span className="font-display font-bold text-foreground dark:text-primary">
              {roleCount}
            </span>{' '}
            <span className="text-muted-foreground">
              / {totalSystemUsers} user
            </span>
            <p className="text-[11px] text-muted-foreground">
              {t('users.systemRolesCount', { count: totalRolesCount })}
            </p>
          </div>
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
      key: 'statusTotal',
      header: t('users.colStatusTotal'),
      render: (item) => {
        const statusCount =
          item.statusUserCount ?? userStats?.byStatus?.[item.status] ?? 0;
        return (
          <div className="text-xs">
            <span className="font-display font-bold text-foreground dark:text-primary">
              {statusCount}
            </span>{' '}
            <span className="text-muted-foreground">
              {item.status} / {totalSystemUsers}
            </span>
            <p className="text-[11px] text-muted-foreground">
              Active: {userStats?.active ?? 0} • Locked:{' '}
              {userStats?.locked ?? 0}
            </p>
          </div>
        );
      },
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
            {canViewUsers ? (
              <PermissionGate permission={PERMISSIONS.USERS_READ}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewingUser(item)}
                  title={t('users.viewDetailTooltip')}
                >
                  <Eye className="h-4 w-4 text-foreground dark:text-primary" />
                </Button>
              </PermissionGate>
            ) : null}

            {canManageRow ? (
              <PermissionGate permission={PERMISSIONS.USERS_UPDATE}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingUser(item)}
                  title={t('users.editTooltip')}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setResetPasswordUser(item)}
                  title={t('users.resetPasswordTooltip')}
                >
                  <KeyRound className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleLock(item)}
                  title={
                    item.status === 'ACTIVE'
                      ? t('users.lockTooltip')
                      : t('users.unlockTooltip')
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
                title={t('users.onlySuperAdminDesc')}
              >
                <Lock className="h-3.5 w-3.5" />
                {t('users.onlySuperAdmin')}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const meta = usersResponse?.meta;

  if (!canViewUsers) {
    return <Navigate to="/forbidden" replace />;
  }

  return (
    <div className="page-container">
      <PageHeader
        subtitle={t('users.subtitle')}
        title={t('users.title')}
        badge={`${totalSystemUsers} Users`}
        description={
          isSuperAdmin
            ? `${t('users.desc')} — ${t('users.descSuperAdmin')}`
            : `${t('users.desc')} — ${t('users.descManager', { role: actorRoleCode || 'STORE_MANAGER' })}`
        }
        actions={
          <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
            <Button onClick={() => setShowCreateModal(true)}>
              <UserPlus className="h-4 w-4" />
              <span>{t('users.addBtn')}</span>
            </Button>
          </PermissionGate>
        }
      />

      {/* Bảng Tổng hợp: Tổng các vai trò & Tổng trạng thái */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="section-container">
          <div className="section-container-header">
            <div className="flex items-center gap-2.5">
              <div className="stat-card-icon h-8 w-8">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                  {t('users.summaryRolesTitle', { count: totalRolesCount })}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {t('users.summaryRolesSub', { total: totalSystemUsers })}
                </p>
              </div>
            </div>
            <span className="status-badge status-active font-mono text-xs">
              {totalSystemUsers} Users
            </span>
          </div>

          <div className="p-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {roles.map((r) => {
              const count = userStats?.byRole?.[r.code] ?? r.userCount ?? 0;
              const active = roleFilter === r.code;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() =>
                    updateUrlParams({
                      roleCode: active ? 'ALL' : r.code,
                      page: 1,
                    })
                  }
                  className={`rounded-lg border p-2.5 text-left transition ${
                    active
                      ? 'border-primary bg-primary/15'
                      : 'border-border bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <p className="truncate font-mono text-[10px] font-semibold text-muted-foreground">
                    {r.code}
                  </p>
                  <p className="mt-0.5 font-display text-lg font-bold text-foreground dark:text-primary">
                    {count}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {r.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="section-container">
          <div className="section-container-header">
            <div className="flex items-center gap-2.5">
              <div className="stat-card-icon h-8 w-8">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                  {t('users.summaryStatusTitle')}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {t('users.summaryStatusSub')}
                </p>
              </div>
            </div>
            <span className="status-badge status-active font-mono text-xs">
              Active: {userStats?.active ?? 0}
            </span>
          </div>

          <div className="p-4 grid grid-cols-3 gap-2">
            {(
              [
                {
                  key: 'ACTIVE',
                  label: t('status.ACTIVE'),
                  count: userStats?.active ?? 0,
                },
                {
                  key: 'LOCKED',
                  label: t('status.LOCKED'),
                  count: userStats?.locked ?? 0,
                },
                {
                  key: 'INACTIVE',
                  label: t('status.INACTIVE'),
                  count: userStats?.inactive ?? 0,
                },
              ] as const
            ).map((st) => {
              const active = statusFilter === st.key;
              return (
                <button
                  key={st.key}
                  type="button"
                  onClick={() =>
                    updateUrlParams({
                      status: active ? '' : st.key,
                      page: 1,
                    })
                  }
                  className={`rounded-lg border p-2.5 text-left transition ${
                    active
                      ? 'border-primary bg-primary/15'
                      : 'border-border bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <p className="font-mono text-[10px] font-semibold text-muted-foreground">
                    {st.key}
                  </p>
                  <p className="mt-0.5 font-display text-lg font-bold text-foreground dark:text-primary">
                    {st.count}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {st.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Container chính: Tabs Vai trò + Bộ lọc Tìm kiếm + Bảng User + Phân trang */}
      <PageSectionContainer
        title="Danh sách Tài khoản & Phân quyền"
        subBadge="User Directory & RBAC"
        description="Quản lý tài khoản nhân sự, khách hàng và phân cấp vai trò bảo mật trong hệ thống"
        icon={Users}
        headerRight={
          <Tabs
            value={roleFilter}
            onValueChange={(val) => updateUrlParams({ roleCode: val, page: 1 })}
          >
            <TabsList className="flex h-auto flex-wrap justify-start gap-1">
              {ROLE_TABS.map((tab) => {
                const tabCount =
                  tab.roleCode === 'ALL'
                    ? totalSystemUsers
                    : (userStats?.byRole?.[tab.roleCode] ?? 0);
                return (
                  <TabsTrigger key={tab.roleCode} value={tab.roleCode}>
                    <span>{t(tab.labelKey)}</span>
                    <span className="ml-1.5 rounded bg-background/60 px-1.5 py-0.2 font-mono text-[10px]">
                      {tabCount}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        }
        toolbar={
          <>
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
              options={userStatusOptions}
              className="sm:w-52"
            />
          </>
        }
        noBodyPadding
        footer={
          <Pagination
            embedded
            page={meta?.page || pageParam}
            totalPages={meta?.totalPages || 1}
            total={meta?.total || 0}
            limit={meta?.limit || limitParam}
            onPageChange={(nextPage) => updateUrlParams({ page: nextPage })}
            onLimitChange={(nextLimit) =>
              updateUrlParams({ limit: nextLimit, page: 1 })
            }
          />
        }
      >
        <ResponsiveTable
          embedded
          columns={columns}
          data={usersResponse?.data || []}
          keyExtractor={(u) => u.id}
          isLoading={isLoading}
          isFetching={isSearching}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </PageSectionContainer>

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
