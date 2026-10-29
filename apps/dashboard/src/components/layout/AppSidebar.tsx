import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  KeyRound,
  LayoutDashboard,
  LucideIcon,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
  Sparkles,
  Tags,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../../constants/rbac.constants';
import { useAuthContext } from '../../features/auth/context/AuthContext';
import { TranslationKey, useI18n } from '../../features/i18n/I18nContext';
import { cn } from '../../lib/utils';

export interface AdminNavItem {
  to: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  permission: string;
  allowedRoles?: string[];
  children?: AdminNavItem[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    to: '/',
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    to: '/products',
    labelKey: 'nav.productsGroup',
    icon: Package,
    permission: PERMISSIONS.PRODUCTS_READ,
    children: [
      {
        to: '/products',
        labelKey: 'nav.products',
        icon: Package,
        permission: PERMISSIONS.PRODUCTS_READ,
      },
      {
        to: '/categories',
        labelKey: 'nav.categories',
        icon: FolderTree,
        permission: PERMISSIONS.PRODUCTS_READ,
      },
      {
        to: '/tags',
        labelKey: 'nav.tags',
        icon: Tags,
        permission: PERMISSIONS.PRODUCTS_READ,
      },
    ],
  },
  {
    to: '/users',
    labelKey: 'nav.users',
    icon: Users,
    permission: PERMISSIONS.USERS_READ,
    allowedRoles: ADMIN_MANAGER_ROLES,
  },
  {
    to: '/roles',
    labelKey: 'nav.roles',
    icon: KeyRound,
    permission: PERMISSIONS.ROLES_READ,
  },
  {
    to: '/settings/notifications',
    labelKey: 'nav.notifications',
    icon: Bell,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
];

const SIDEBAR_STORAGE_KEY = 'bonzstore_sidebar_collapsed';

export function AppSidebar() {
  const { hasPermission, hasAnyRole, user } = useAuthContext();
  const { t } = useI18n();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });

  const isCatalogRoute =
    location.pathname.startsWith('/products') ||
    location.pathname.startsWith('/categories') ||
    location.pathname.startsWith('/tags');

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    '/products': true,
  });

  useEffect(() => {
    if (isCatalogRoute) {
      setOpenGroups((prev) => ({ ...prev, '/products': true }));
    }
  }, [isCatalogRoute]);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const toggleGroup = (groupKey: string) => {
    if (collapsed) {
      setCollapsed(false);
      localStorage.setItem(SIDEBAR_STORAGE_KEY, 'false');
      setOpenGroups((prev) => ({ ...prev, [groupKey]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const visibleItems = ADMIN_NAV_ITEMS.filter(
    (item) =>
      (!item.permission || hasPermission(item.permission)) &&
      (!item.allowedRoles || hasAnyRole(item.allowedRoles)),
  );

  return (
    <aside
      className={cn(
        'relative hidden shrink-0 flex-col border-r border-border bg-card transition-all duration-200 md:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header + Collapse Button */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="stat-card-icon h-9 w-9 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="truncate">
              <span className="font-display text-base font-bold tracking-tight text-foreground">
                BonzStore
              </span>
              <span className="ml-1.5 rounded border border-primary/40 bg-primary/25 px-1.5 py-0.5 font-display text-[10px] font-bold uppercase text-foreground dark:text-primary">
                Anime
              </span>
            </div>
          </div>
        ) : (
          <div
            className="stat-card-icon h-9 w-9 cursor-pointer"
            onClick={toggleSidebar}
            title={t('nav.expandSidebar')}
          >
            <Sparkles className="h-5 w-5" />
          </div>
        )}

        {!collapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="table-action-btn shrink-0"
            title={t('nav.collapseSidebar')}
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Floating Edge Toggle Button */}
      <button
        type="button"
        onClick={toggleSidebar}
        title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
        className="absolute -right-3 top-20 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary hover:text-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-2.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const label = t(item.labelKey);

          // Dropdown Group Item (e.g. Sản phẩm -> Tất cả sản phẩm / Danh mục / Thẻ)
          if (item.children && item.children.length > 0) {
            const visibleChildren = item.children.filter(
              (child) =>
                (!child.permission || hasPermission(child.permission)) &&
                (!child.allowedRoles || hasAnyRole(child.allowedRoles)),
            );
            const isGroupActive = visibleChildren.some((child) =>
              location.pathname.startsWith(child.to),
            );
            const isOpen = !!openGroups[item.to];

            return (
              <div key={item.to} className="group/dropdown relative space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.to)}
                  title={collapsed ? label : undefined}
                  className={cn(
                    'flex w-full items-center rounded-lg py-2.5 text-sm font-semibold transition-colors',
                    collapsed
                      ? 'justify-center px-2'
                      : 'justify-between px-3.5',
                    isGroupActive
                      ? 'bg-primary/20 text-foreground dark:text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed ? (
                      <span className="truncate">{label}</span>
                    ) : null}
                  </div>

                  {!collapsed ? (
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform duration-200',
                        isOpen ? 'rotate-0' : '-rotate-90',
                      )}
                    />
                  ) : null}
                </button>

                {/* Expanded Sidebar Dropdown Sub-menu */}
                {!collapsed && isOpen ? (
                  <div className="ml-5 space-y-1 border-l border-border pl-2.5">
                    {visibleChildren.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )
                          }
                        >
                          <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{t(child.labelKey)}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ) : null}

                {/* Collapsed Sidebar Hover Flyout Dropdown */}
                {collapsed ? (
                  <div className="invisible absolute left-full top-0 z-30 ml-2 w-48 rounded-xl border border-border bg-card p-1.5 opacity-0 shadow-lg transition-all group-hover/dropdown:visible group-hover/dropdown:opacity-100">
                    <div className="border-b border-border px-2.5 py-1.5 font-display text-xs font-bold text-foreground">
                      {label}
                    </div>
                    <div className="mt-1 space-y-1">
                      {visibleChildren.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                              )
                            }
                          >
                            <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>{t(child.labelKey)}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          }

          // Standard Single Nav Item
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg py-2.5 text-sm font-semibold transition-colors',
                  collapsed ? 'justify-center px-2' : 'gap-3 px-3.5',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span className="truncate">{label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer RBAC Summary / Expand Toggle */}
      <div className="border-t border-border p-3">
        {collapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-lg border border-primary/20 bg-muted/50 p-2.5 text-foreground hover:bg-muted dark:text-primary"
            title={`RBAC: ${user?.role?.name} (${user?.permissions?.length || 0} quyền) — Bấm để mở rộng`}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        ) : (
          <div className="rounded-lg border border-primary/20 bg-muted/50 p-3 text-xs">
            <div className="flex items-center gap-2 font-display font-bold text-foreground">
              <ShieldAlert className="h-4 w-4 shrink-0 text-foreground dark:text-primary" />
              <span className="truncate">3-Layer RBAC Active</span>
            </div>
            <p className="mt-1 truncate text-muted-foreground">
              Role: <strong className="text-foreground">{user?.role?.name}</strong>
            </p>
            <p className="text-muted-foreground">
              {t('nav.allowedPages')}:{' '}
              <strong className="text-foreground dark:text-primary">
                {visibleItems.length}
              </strong>{' '}
              / {ADMIN_NAV_ITEMS.length}
            </p>
            <p className="text-muted-foreground">
              {t('nav.totalPerms')}:{' '}
              <strong className="text-foreground dark:text-primary">
                {user?.permissions?.length || 0}
              </strong>
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
