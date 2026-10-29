import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ExternalLink,
  Pencil,
  PlusCircle,
  Settings,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AdminNotificationItem,
  NotificationAction,
  NotificationModuleType,
} from '../../../api/types/notification.types';
import { ADMIN_MANAGER_ROLES } from '../../../constants/rbac.constants';
import { cn, formatDateTime } from '../../../lib/utils';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationSettings,
  usePaginatedNotifications,
} from '../hooks/useNotifications';

type BellFilterTab = 'ALL' | 'UNREAD' | NotificationAction;

export function NotificationBell() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuthContext();
  const canManage = hasAnyRole(ADMIN_MANAGER_ROLES);

  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BellFilterTab>('ALL');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { data: settings } = useNotificationSettings();
  const { data: notificationsRes } = usePaginatedNotifications({
    page: 1,
    limit: 15,
    readStatus: activeFilter === 'UNREAD' ? 'UNREAD' : 'ALL',
    action:
      activeFilter === 'CREATE' ||
        activeFilter === 'UPDATE' ||
        activeFilter === 'DELETE'
        ? activeFilter
        : 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const stats = notificationsRes?.stats;
  const unreadCount = stats?.unreadCount ?? 0;
  const items = notificationsRes?.data ?? [];
  const masterEnabled = settings?.masterEnabled !== false;

  const renderActionBadge = (action: NotificationAction) => {
    if (action === 'CREATE') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          <PlusCircle className="h-3 w-3" />
          <span>{t('notifications.actionCreateShort')}</span>
        </span>
      );
    }
    if (action === 'UPDATE') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
          <Pencil className="h-3 w-3" />
          <span>{t('notifications.actionUpdateShort')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
        <Trash2 className="h-3 w-3" />
        <span>{t('notifications.actionDeleteShort')}</span>
      </span>
    );
  };

  const getModuleShortLabel = (mod: NotificationModuleType) => {
    switch (mod) {
      case 'PRODUCTS':
        return t('notifications.moduleProducts');
      case 'CATEGORIES':
        return t('notifications.moduleCategories');
      case 'TAGS':
        return t('notifications.moduleTags');
      case 'USERS':
        return t('notifications.moduleUsers');
      case 'ROLES':
        return t('notifications.moduleRoles');
    }
  };

  const handleClickItem = (item: AdminNotificationItem) => {
    if (!item.isRead) {
      markReadMutation.mutate({ id: item.id, isRead: true });
    }
    setOpen(false);
    if (item.targetLink) {
      navigate(item.targetLink);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="action-btn-secondary relative px-2.5 py-1.5"
        title={t('notifications.bellTitle')}
      >
        {masterEnabled ? (
          <Bell className="h-4 w-4 text-foreground dark:text-primary" />
        ) : (
          <BellOff className="h-4 w-4 text-muted-foreground" />
        )}

        {unreadCount > 0 ? (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-[350px] overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:w-[420px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-foreground dark:text-primary" />
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                {t('notifications.bellTitle')}
              </h3>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  {t('notifications.unreadBadge', { count: unreadCount })}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-foreground transition hover:bg-muted dark:text-primary"
                  title={t('notifications.markAllRead')}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>{t('notifications.markAllRead')}</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/settings/notifications');
                }}
                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                title={t('notifications.openSettings')}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills (All / Unread / Create / Update / Delete) */}
          <div className="flex flex-wrap items-center gap-1 border-b border-border bg-background/50 px-3 py-2 text-[11px]">
            {(
              [
                {
                  key: 'ALL',
                  label: `${t('notifications.tabAll')} (${stats?.total ?? 0})`,
                },
                {
                  key: 'UNREAD',
                  label: `${t('notifications.tabUnread')} (${stats?.unreadCount ?? 0})`,
                },
                {
                  key: 'CREATE',
                  label: `${t('notifications.actionCreateShort')} (${stats?.byAction?.CREATE ?? 0})`,
                },
                {
                  key: 'UPDATE',
                  label: `${t('notifications.actionUpdateShort')} (${stats?.byAction?.UPDATE ?? 0})`,
                },
                {
                  key: 'DELETE',
                  label: `${t('notifications.actionDeleteShort')} (${stats?.byAction?.DELETE ?? 0})`,
                },
              ] as const
            ).map((tab) => {
              const active = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    'rounded-md px-2 py-1 font-medium transition',
                    active
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Notification Items List */}
          <div className="max-h-[370px] divide-y divide-border overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                {t('notifications.emptyBell')}
              </div>
            ) : (
              items.map((item) => {
                const title = locale === 'en' ? item.titleEn : item.titleVi;
                const message =
                  locale === 'en' ? item.messageEn : item.messageVi;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'group flex items-start justify-between gap-2.5 px-3.5 py-3 text-xs transition hover:bg-muted/30',
                      !item.isRead && 'bg-primary/5',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleClickItem(item)}
                      className="min-w-0 flex-1 space-y-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        {!item.isRead ? (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                        ) : null}
                        {renderActionBadge(item.action)}
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                          {getModuleShortLabel(item.module)}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          • {item.actorRole}
                        </span>
                      </div>

                      <p className="font-semibold text-foreground">{title}</p>

                      <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {message}
                      </p>

                      <div className="flex items-center gap-2 pt-0.5 font-mono text-[10px] text-muted-foreground">
                        <span>{formatDateTime(item.createdAt)}</span>
                        <span className="inline-flex items-center gap-0.5 text-foreground dark:text-primary">
                          <span>{t('notifications.goToTarget')}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </button>

                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          markReadMutation.mutate({
                            id: item.id,
                            isRead: !item.isRead,
                          })
                        }
                        className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        title={t('notifications.markReadTooltip')}
                      >
                        <Check
                          className={cn(
                            'h-3.5 w-3.5',
                            !item.isRead &&
                            'text-emerald-600 dark:text-emerald-400',
                          )}
                        />
                      </button>

                      {canManage ? (
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="rounded p-1 text-rose-500 opacity-75 transition hover:bg-rose-500/10 hover:opacity-100"
                          title={t('notifications.deleteTooltip')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link to Notification Settings Page */}
          <div className="border-t border-border bg-muted/20 p-2.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/settings/notifications');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted dark:text-primary"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>{t('notifications.openSettings')}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

