import { Lock, ShieldCheck, Unlock, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { UserItem, UserStatus } from '../api/types/user.types';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { TranslationKey, useI18n } from '../features/i18n/I18nContext';
import { useRoles } from '../features/roles/hooks/useRoles';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatusBadge } from '../features/shared/StatusBadge';
import {
  useCreateUser,
  useUpdateUser,
  useUsers,
} from '../features/users/hooks/useUsers';

const ROLE_TABS: Array<{ labelKey: TranslationKey; roleCode: string }> = [
  { labelKey: 'users.tabAll', roleCode: '' },
  { labelKey: 'users.tabAdmin', roleCode: 'SUPER_ADMIN' },
  { labelKey: 'users.tabManager', roleCode: 'STORE_MANAGER' },
  { labelKey: 'users.tabStaff', roleCode: 'STAFF' },
  { labelKey: 'users.tabCustomer', roleCode: 'CUSTOMER' },
];

export function UsersPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: usersResponse, isLoading } = useUsers({
    search: search || undefined,
    status: statusFilter || undefined,
    roleCode: roleFilter || undefined,
  });
  const { data: roles } = useRoles();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const [formState, setFormState] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    roleIdOrCode: 'STAFF',
  });

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    await createUserMutation.mutateAsync(formState);
    setShowCreateModal(false);
    setFormState({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      roleIdOrCode: 'STAFF',
    });
  };

  const handleToggleLock = (user: UserItem) => {
    const nextStatus: UserStatus =
      user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    updateUserMutation.mutate({
      id: user.id,
      data: { status: nextStatus },
    });
  };

  const handleChangeRole = (user: UserItem, newRoleCode: string) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { roleIdOrCode: newRoleCode },
    });
  };

  const columns: Column<UserItem>[] = [
    {
      key: 'user',
      header: t('users.colAccount'),
      isPrimary: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-foreground">{item.fullName}</p>
          <p className="text-xs text-muted-foreground">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('users.colRole'),
      render: (item) => (
        <PermissionGate
          permission="users.update"
          fallback={
            <span className="font-medium text-foreground dark:text-primary">
              {item.role?.name} ({item.role?.code})
            </span>
          }
        >
          <select
            value={item.role?.code || ''}
            onChange={(e) => handleChangeRole(item, e.target.value)}
            className="rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary"
          >
            {roles?.map((r) => (
              <option key={r.id} value={r.code}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </PermissionGate>
      ),
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
      render: (item) => (
        <PermissionGate permission="users.update">
          <button
            type="button"
            onClick={() => handleToggleLock(item)}
            className="table-action-btn"
          >
            {item.status === 'ACTIVE' ? (
              <Lock className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            ) : (
              <Unlock className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            )}
          </button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle={t('users.subtitle')}
        title={t('users.title')}
        description={t('users.desc')}
        actions={
          <PermissionGate permission="users.create">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="action-btn-primary"
            >
              <UserPlus className="h-4 w-4" />
              <span>{t('users.addBtn')}</span>
            </button>
          </PermissionGate>
        }
      />

      <div className="flex flex-wrap gap-2">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.roleCode}
            type="button"
            onClick={() => setRoleFilter(tab.roleCode)}
            className={
              roleFilter === tab.roleCode
                ? 'action-btn-primary py-1.5 text-xs'
                : 'action-btn-secondary py-1.5 text-xs'
            }
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="filter-panel flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('users.searchPlaceholder')}
          className="flex-1 rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
          className="rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">{t('users.allStatus')}</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="LOCKED">LOCKED</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      <ResponsiveTable
        columns={columns}
        data={usersResponse?.data || []}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
      />

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="stat-card w-full max-w-md space-y-4 p-6">
            <h2 className="font-display text-lg font-bold">
              {t('users.modalTitle')}
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  {t('users.fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState({ ...formState, fullName: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) =>
                    setFormState({ ...formState, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  {t('users.initPassword')}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formState.password}
                  onChange={(e) =>
                    setFormState({ ...formState, password: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  {t('users.colRole')}
                </label>
                <select
                  value={formState.roleIdOrCode}
                  onChange={(e) =>
                    setFormState({ ...formState, roleIdOrCode: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  {roles?.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
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
                  disabled={createUserMutation.isPending}
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
