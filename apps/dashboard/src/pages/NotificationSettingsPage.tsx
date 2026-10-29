import { isEmpty, trim } from 'lodash';
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  FolderTree,
  KeyRound,
  Loader2,
  Lock,
  Package,
  Pencil,
  PlusCircle,
  RotateCcw,
  Search,
  Send,
  Settings2,
  Tags,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AdminNotificationItem,
  NotificationAction,
  NotificationModuleType,
  NotificationSortField,
} from '../api/types/notification.types';
import { SortOrder } from '../api/types/user.types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Pagination } from '../components/ui/pagination';
import { Select } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { TranslationKey, useI18n } from '../features/i18n/I18nContext';
import {
  useClearReadNotifications,
  useCreateTestNotification,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationSettings,
  usePaginatedNotifications,
  useResetNotificationSettings,
  useUpdateNotificationSettings,
} from '../features/notifications/hooks/useNotifications';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { buildCleanSearchParams, cn, formatDateTime } from '../lib/utils';

const DEFAULT_NOTIFICATIONS_LIMIT = 10;

const MODULE_ROWS: Array<{
  module: NotificationModuleType;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  icon: typeof Package;
}> = [
  {
    module: 'PRODUCTS',
    labelKey: 'notifications.moduleProducts',
    descKey: 'notifications.moduleProductsDesc',
    icon: Package,
  },
  {
    module: 'CATEGORIES',
    labelKey: 'notifications.moduleCategories',
    descKey: 'notifications.moduleCategoriesDesc',
    icon: FolderTree,
  },
  {
    module: 'TAGS',
    labelKey: 'notifications.moduleTags',
    descKey: 'notifications.moduleTagsDesc',
    icon: Tags,
  },
  {
    module: 'USERS',
    labelKey: 'notifications.moduleUsers',
    descKey: 'notifications.moduleUsersDesc',
    icon: Users,
  },
  {
    module: 'ROLES',
    labelKey: 'notifications.moduleRoles',
    descKey: 'notifications.moduleRolesDesc',
    icon: KeyRound,
  },
];

export function NotificationSettingsPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuthContext();

  const canManageNotifications = hasAnyRole(ADMIN_MANAGER_ROLES);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const pageParam = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limitParam = Math.min(
    50,
    Math.max(
      10,
      Number(searchParams.get('limit')) || DEFAULT_NOTIFICATIONS_LIMIT,
    ),
  );
  const moduleFilter =
    (searchParams.get('module') as 'ALL' | NotificationModuleType) || 'ALL';
  const actionFilter =
    (searchParams.get('action') as 'ALL' | NotificationAction) || 'ALL';
  const readStatusFilter =
    (searchParams.get('readStatus') as 'ALL' | 'UNREAD' | 'READ') || 'ALL';
  const sortBy =
    (searchParams.get('sortBy') as NotificationSortField) || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'desc';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const [testModule, setTestModule] =
    useState<NotificationModuleType>('PRODUCTS');
  const [testAction, setTestAction] = useState<NotificationAction>('CREATE');

  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || '';
    const cleanedDebounced = trim(debouncedSearch);
    if (cleanedDebounced !== currentUrlSearch) {
      const nextParams = buildCleanSearchParams(
        {
          search: cleanedDebounced,
          module: moduleFilter,
          action: actionFilter,
          readStatus: readStatusFilter,
          sortBy,
          sortOrder,
          page: 1,
          limit: limitParam,
        },
        {
          module: 'ALL',
          action: 'ALL',
          readStatus: 'ALL',
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: DEFAULT_NOTIFICATIONS_LIMIT,
        },
      );
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    actionFilter,
    debouncedSearch,
    limitParam,
    moduleFilter,
    readStatusFilter,
    searchParams,
    setSearchParams,
    sortBy,
    sortOrder,
  ]);

  const updateUrlParams = (
    overrides: Partial<{
      page: number;
      limit: number;
      module: 'ALL' | NotificationModuleType;
      action: 'ALL' | NotificationAction;
      readStatus: 'ALL' | 'UNREAD' | 'READ';
      sortBy: NotificationSortField;
      sortOrder: SortOrder;
    }>,
  ) => {
    const nextParams = buildCleanSearchParams(
      {
        search: trim(debouncedSearch),
        module: overrides.module ?? moduleFilter,
        action: overrides.action ?? actionFilter,
        readStatus: overrides.readStatus ?? readStatusFilter,
        sortBy: overrides.sortBy ?? sortBy,
        sortOrder: overrides.sortOrder ?? sortOrder,
        page: overrides.page ?? pageParam,
        limit: overrides.limit ?? limitParam,
      },
      {
        module: 'ALL',
        action: 'ALL',
        readStatus: 'ALL',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: DEFAULT_NOTIFICATIONS_LIMIT,
      },
    );
    setSearchParams(nextParams);
  };

  const { data: settings } = useNotificationSettings();
  const {
    data: paginatedResponse,
    isLoading,
    isFetching,
  } = usePaginatedNotifications({
    page: pageParam,
    limit: limitParam,
    search: !isEmpty(trim(debouncedSearch)) ? trim(debouncedSearch) : undefined,
    module: moduleFilter !== 'ALL' ? moduleFilter : undefined,
    action: actionFilter !== 'ALL' ? actionFilter : undefined,
    readStatus: readStatusFilter !== 'ALL' ? readStatusFilter : undefined,
    sortBy,
    sortOrder,
  });

  const updateSettingsMutation = useUpdateNotificationSettings();
  const resetSettingsMutation = useResetNotificationSettings();
  const createTestMutation = useCreateTestNotification();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const clearReadMutation = useClearReadNotifications();
  const deleteMutation = useDeleteNotification();

  const handleSortChange = (clickedKey: string) => {
    const field = clickedKey as NotificationSortField;
    const nextOrder: SortOrder =
      sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    updateUrlParams({ sortBy: field, sortOrder: nextOrder, page: 1 });
  };

  const handleToggleModuleAction = (
    mod: NotificationModuleType,
    act: NotificationAction,
    checked: boolean,
  ) => {
    if (!canManageNotifications) return;
    updateSettingsMutation.mutate({
      modules: {
        [mod]: {
          [act]: checked,
        },
      },
    });
  };

  const handleToggleRowAll = (
    mod: NotificationModuleType,
    enableAll: boolean,
  ) => {
    if (!canManageNotifications) return;
    updateSettingsMutation.mutate({
      modules: {
        [mod]: {
          CREATE: enableAll,
          UPDATE: enableAll,
          DELETE: enableAll,
        },
      },
    });
  };

  const handleToggleColumnAction = (act: NotificationAction) => {
    if (!canManageNotifications || !settings) return;
    const allCurrentlyOn = MODULE_ROWS.every(
      (r) => settings.modules[r.module]?.[act] === true,
    );
    const nextVal = !allCurrentlyOn;
    const modulesPatch: Partial<
      Record<
        NotificationModuleType,
        Partial<Record<NotificationAction, boolean>>
      >
    > = {};
    for (const r of MODULE_ROWS) {
      modulesPatch[r.module] = { [act]: nextVal };
    }
    updateSettingsMutation.mutate({ modules: modulesPatch });
  };

  const renderActionBadge = (action: NotificationAction) => {
    if (action === 'CREATE') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <PlusCircle className="h-3.5 w-3.5" />
          <span>{t('notifications.actionCreateShort')}</span>
        </span>
      );
    }
    if (action === 'UPDATE') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
          <Pencil className="h-3.5 w-3.5" />
          <span>{t('notifications.actionUpdateShort')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
        <Trash2 className="h-3.5 w-3.5" />
        <span>{t('notifications.actionDeleteShort')}</span>
      </span>
    );
  };

  const getModuleLabel = (mod: NotificationModuleType) => {
    const found = MODULE_ROWS.find((r) => r.module === mod);
    return found ? t(found.labelKey) : mod;
  };

  const isSearching =
    isFetching || trim(searchInput) !== trim(debouncedSearch);

  const columns: Column<AdminNotificationItem>[] = [
    {
      key: 'notification',
      header: t('notifications.colNotification'),
      isPrimary: true,
      render: (item) => {
        const title = locale === 'en' ? item.titleEn : item.titleVi;
        const message = locale === 'en' ? item.messageEn : item.messageVi;
        return (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {!item.isRead ? (
                <span className="h-2 w-2 rounded-full bg-rose-500" />
              ) : null}
              <span className="font-semibold text-foreground">{title}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                {item.targetName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>
        );
      },
    },
    {
      key: 'module',
      header: t('notifications.colModule'),
      sortKey: 'module',
      render: (item) => (
        <span className="rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs font-semibold text-foreground">
          {getModuleLabel(item.module)}
        </span>
      ),
    },
    {
      key: 'action',
      header: t('notifications.colActionType'),
      sortKey: 'action',
      render: (item) => renderActionBadge(item.action),
    },
    {
      key: 'actor',
      header: t('notifications.colActor'),
      render: (item) => (
        <div className="text-xs">
          <p className="font-semibold text-foreground">{item.actorName}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {item.actorRole} • {item.actorEmail}
          </p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: t('notifications.colTime'),
      sortKey: 'createdAt',
      render: (item) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDateTime(item.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('app.actions'),
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              markReadMutation.mutate({
                id: item.id,
                isRead: !item.isRead,
              })
            }
            title={t('notifications.markReadTooltip')}
          >
            <Check
              className={cn(
                'h-4 w-4',
                !item.isRead
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground',
              )}
            />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate(item.targetLink)}
            title={t('notifications.goToTarget')}
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>

          {canManageNotifications ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate(item.id)}
              title={t('notifications.deleteTooltip')}
            >
              <Trash2 className="h-4 w-4 text-rose-500 hover:text-rose-600 dark:text-rose-400" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const stats = paginatedResponse?.stats;
  const meta = paginatedResponse?.meta;
  const notificationsData = paginatedResponse?.data || [];
  const masterEnabled = settings?.masterEnabled !== false;

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle={t('notifications.pageSubtitle')}
        title={t('notifications.pageTitle')}
        description={t('notifications.pageDesc')}
        actions={
          <PermissionGate
            roles={ADMIN_MANAGER_ROLES}
            permission={PERMISSIONS.DASHBOARD_VIEW}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={resetSettingsMutation.isPending}
                onClick={() => resetSettingsMutation.mutate()}
              >
                <RotateCcw className="h-4 w-4" />
                <span>{t('notifications.resetBtn')}</span>
              </Button>

              <Button
                type="button"
                disabled={createTestMutation.isPending}
                onClick={() =>
                  createTestMutation.mutate({
                    module: testModule,
                    action: testAction,
                  })
                }
              >
                <Send className="h-4 w-4" />
                <span>{t('notifications.testBtn')}</span>
              </Button>
            </div>
          </PermissionGate>
        }
      />

      {/* 1. Thống kê nhanh theo Tác vụ Thêm / Sửa / Xóa */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t('notifications.statTotal')}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground dark:text-primary">
              {stats?.total ?? 0}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-rose-500">
              {t('notifications.unreadBadge', {
                count: stats?.unreadCount ?? 0,
              })}
            </p>
          </div>
          <div className="stat-card-icon h-10 w-10">
            <Bell className="h-5 w-5" />
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            updateUrlParams({
              action: actionFilter === 'CREATE' ? 'ALL' : 'CREATE',
              page: 1,
            })
          }
          className={cn(
            'stat-card flex items-center justify-between text-left transition',
            actionFilter === 'CREATE' && 'border-primary ring-1 ring-primary',
          )}
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t('notifications.statCreate')}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.byAction?.CREATE ?? 0}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              CREATE Events
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <PlusCircle className="h-5 w-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            updateUrlParams({
              action: actionFilter === 'UPDATE' ? 'ALL' : 'UPDATE',
              page: 1,
            })
          }
          className={cn(
            'stat-card flex items-center justify-between text-left transition',
            actionFilter === 'UPDATE' && 'border-primary ring-1 ring-primary',
          )}
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t('notifications.statUpdate')}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats?.byAction?.UPDATE ?? 0}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              UPDATE Events
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Pencil className="h-5 w-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            updateUrlParams({
              action: actionFilter === 'DELETE' ? 'ALL' : 'DELETE',
              page: 1,
            })
          }
          className={cn(
            'stat-card flex items-center justify-between text-left transition',
            actionFilter === 'DELETE' && 'border-primary ring-1 ring-primary',
          )}
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t('notifications.statDelete')}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats?.byAction?.DELETE ?? 0}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              DELETE Events
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <Trash2 className="h-5 w-5" />
          </div>
        </button>
      </div>

      {/* 2. Cấu hình Tổng quát & Ma trận Thông báo theo Tác vụ Thêm - Xóa - Sửa */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột trái: Cấu hình tổng quát & Tạo thông báo Test */}
        <div className="space-y-4 lg:col-span-4">
          <div className="stat-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Settings2 className="h-4 w-4 text-foreground dark:text-primary" />
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                {t('notifications.globalConfigTitle')}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {t('notifications.masterSwitchLabel')}
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {t('notifications.masterSwitchDesc')}
                  </p>
                </div>
                <Switch
                  checked={masterEnabled}
                  disabled={!canManageNotifications}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({ masterEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {t('notifications.toastSwitchLabel')}
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {t('notifications.toastSwitchDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings?.showToastOnEvent !== false}
                  disabled={!canManageNotifications || !masterEnabled}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({ showToastOnEvent: checked })
                  }
                />
              </div>

              <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {t('notifications.adminOnlySwitchLabel')}
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {t('notifications.adminOnlySwitchDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings?.onlyAdminActions !== false}
                  disabled={!canManageNotifications || !masterEnabled}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({ onlyAdminActions: checked })
                  }
                />
              </div>
            </div>

            {/* Khung bắn thử thông báo theo Phân hệ & Tác vụ Thêm/Sửa/Xóa */}
            {canManageNotifications ? (
              <div className="space-y-2.5 rounded-xl border border-primary/30 bg-primary/10 p-3.5">
                <p className="font-display text-xs font-bold uppercase text-foreground dark:text-primary">
                  {t('notifications.testBtn')}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Select
                    value={testModule}
                    onChange={(e) =>
                      setTestModule(e.target.value as NotificationModuleType)
                    }
                    options={MODULE_ROWS.map((r) => ({
                      value: r.module,
                      label: t(r.labelKey),
                    }))}
                    className="h-8 text-xs"
                  />
                  <Select
                    value={testAction}
                    onChange={(e) =>
                      setTestAction(e.target.value as NotificationAction)
                    }
                    options={[
                      {
                        value: 'CREATE',
                        label: t('notifications.actionCreate'),
                      },
                      {
                        value: 'UPDATE',
                        label: t('notifications.actionUpdate'),
                      },
                      {
                        value: 'DELETE',
                        label: t('notifications.actionDelete'),
                      },
                    ]}
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={createTestMutation.isPending}
                  onClick={() =>
                    createTestMutation.mutate({
                      module: testModule,
                      action: testAction,
                    })
                  }
                  className="w-full"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {t('notifications.testBtn')} ({testModule} • {testAction})
                  </span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <Lock className="h-4 w-4 shrink-0" />
                <span>{t('tags.onlyAdminManagerDesc')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Ma trận Quản lý Thông báo của Tác vụ Thêm - Xóa - Sửa */}
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  {t('notifications.matrixTitle')}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('notifications.matrixDesc')}
                </p>
              </div>

              {canManageNotifications ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!masterEnabled}
                    onClick={() => handleToggleColumnAction('CREATE')}
                    className="h-7 px-2 text-[11px]"
                  >
                    <PlusCircle className="h-3 w-3 text-emerald-500" />
                    <span>{t('notifications.toggleAllCreate')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!masterEnabled}
                    onClick={() => handleToggleColumnAction('UPDATE')}
                    className="h-7 px-2 text-[11px]"
                  >
                    <Pencil className="h-3 w-3 text-amber-500" />
                    <span>{t('notifications.toggleAllUpdate')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!masterEnabled}
                    onClick={() => handleToggleColumnAction('DELETE')}
                    className="h-7 px-2 text-[11px]"
                  >
                    <Trash2 className="h-3 w-3 text-rose-500" />
                    <span>{t('notifications.toggleAllDelete')}</span>
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-display text-[11px] font-bold uppercase text-muted-foreground">
                    <th className="px-4 py-3">
                      {t('notifications.colModule')}
                    </th>
                    <th className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>{t('notifications.colCreateToggle')}</span>
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Pencil className="h-3.5 w-3.5" />
                        <span>{t('notifications.colUpdateToggle')}</span>
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{t('notifications.colDeleteToggle')}</span>
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right">
                      {t('notifications.colQuickAction')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MODULE_ROWS.map((row) => {
                    const Icon = row.icon;
                    const prefs = settings?.modules?.[row.module] || {
                      CREATE: true,
                      UPDATE: true,
                      DELETE: true,
                    };
                    const allRowEnabled =
                      prefs.CREATE && prefs.UPDATE && prefs.DELETE;

                    return (
                      <tr
                        key={row.module}
                        className={cn(
                          'transition-colors hover:bg-muted/25',
                          !masterEnabled && 'opacity-50',
                        )}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-start gap-2.5">
                            <div className="stat-card-icon h-8 w-8 shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {t(row.labelKey)}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {t(row.descKey)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Tác vụ Thêm mới (CREATE) */}
                        <td className="px-3 py-3.5 text-center">
                          <div className="inline-flex justify-center">
                            <Switch
                              checked={Boolean(prefs.CREATE)}
                              disabled={
                                !canManageNotifications || !masterEnabled
                              }
                              onCheckedChange={(checked) =>
                                handleToggleModuleAction(
                                  row.module,
                                  'CREATE',
                                  checked,
                                )
                              }
                            />
                          </div>
                        </td>

                        {/* Tác vụ Chỉnh sửa (UPDATE) */}
                        <td className="px-3 py-3.5 text-center">
                          <div className="inline-flex justify-center">
                            <Switch
                              checked={Boolean(prefs.UPDATE)}
                              disabled={
                                !canManageNotifications || !masterEnabled
                              }
                              onCheckedChange={(checked) =>
                                handleToggleModuleAction(
                                  row.module,
                                  'UPDATE',
                                  checked,
                                )
                              }
                            />
                          </div>
                        </td>

                        {/* Tác vụ Xóa (DELETE) */}
                        <td className="px-3 py-3.5 text-center">
                          <div className="inline-flex justify-center">
                            <Switch
                              checked={Boolean(prefs.DELETE)}
                              disabled={
                                !canManageNotifications || !masterEnabled
                              }
                              onCheckedChange={(checked) =>
                                handleToggleModuleAction(
                                  row.module,
                                  'DELETE',
                                  checked,
                                )
                              }
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          {canManageNotifications ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!masterEnabled}
                              onClick={() =>
                                handleToggleRowAll(row.module, !allRowEnabled)
                              }
                              className="h-7 px-2.5 text-[11px]"
                            >
                              {allRowEnabled
                                ? t('notifications.disableAllRow')
                                : t('notifications.enableAllRow')}
                            </Button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Lock className="h-3.5 w-3.5" />
                              <span>{t('tags.onlyAdminManager')}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lịch sử & Danh sách Thông báo Hệ thống */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
            {t('notifications.historyTitle')}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {(stats?.unreadCount ?? 0) > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={markAllReadMutation.isPending}
                onClick={() => markAllReadMutation.mutate()}
              >
                <CheckCheck className="h-4 w-4" />
                <span>{t('notifications.markAllRead')}</span>
              </Button>
            ) : null}

            {canManageNotifications && (stats?.readCount ?? 0) > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={clearReadMutation.isPending}
                onClick={() => clearReadMutation.mutate()}
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
                <span>{t('notifications.clearRead')}</span>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Thanh Tìm kiếm có Debounce 400ms & Bộ lọc Phân hệ / Tác vụ / Trạng thái */}
        <div className="filter-panel flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('notifications.searchPlaceholder')}
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

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={moduleFilter === 'ALL' ? '' : moduleFilter}
              onChange={(e) =>
                updateUrlParams({
                  module:
                    (e.target.value as NotificationModuleType | '') || 'ALL',
                  page: 1,
                })
              }
              placeholder={t('notifications.allModules')}
              options={MODULE_ROWS.map((r) => ({
                value: r.module,
                label: t(r.labelKey),
              }))}
              className="w-48"
            />

            <Select
              value={actionFilter === 'ALL' ? '' : actionFilter}
              onChange={(e) =>
                updateUrlParams({
                  action: (e.target.value as NotificationAction | '') || 'ALL',
                  page: 1,
                })
              }
              placeholder={t('notifications.allActions')}
              options={[
                { value: 'CREATE', label: t('notifications.actionCreate') },
                { value: 'UPDATE', label: t('notifications.actionUpdate') },
                { value: 'DELETE', label: t('notifications.actionDelete') },
              ]}
              className="w-52"
            />

            <Select
              value={readStatusFilter === 'ALL' ? '' : readStatusFilter}
              onChange={(e) =>
                updateUrlParams({
                  readStatus:
                    (e.target.value as 'UNREAD' | 'READ' | '') || 'ALL',
                  page: 1,
                })
              }
              placeholder={t('notifications.tabAll')}
              options={[
                { value: 'UNREAD', label: t('notifications.tabUnread') },
                { value: 'READ', label: t('notifications.tabRead') },
              ]}
              className="w-36"
            />
          </div>
        </div>

        <ResponsiveTable
          columns={columns}
          data={notificationsData}
          keyExtractor={(item) => item.id}
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
      </div>
    </div>
  );
}

