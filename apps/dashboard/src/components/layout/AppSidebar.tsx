import {
  FolderTree,
  KeyRound,
  LayoutDashboard,
  Package,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../features/auth/context/AuthContext';
import { TranslationKey, useI18n } from '../../features/i18n/I18nContext';
import { cn } from '../../lib/utils';

export const ADMIN_NAV_ITEMS: Array<{
  to: string;
  labelKey: TranslationKey;
  icon: any;
  permission: string;
}> = [
  {
    to: '/',
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard.view',
  },
  {
    to: '/products',
    labelKey: 'nav.products',
    icon: Package,
    permission: 'products.read',
  },
  {
    to: '/categories',
    labelKey: 'nav.categories',
    icon: FolderTree,
    permission: 'products.read',
  },
  {
    to: '/users',
    labelKey: 'nav.users',
    icon: Users,
    permission: 'users.read',
  },
  {
    to: '/roles',
    labelKey: 'nav.roles',
    icon: KeyRound,
    permission: 'roles.read',
  },
];

export function AppSidebar() {
  const { hasPermission, user } = useAuthContext();
  const { t } = useI18n();

  const visibleItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="stat-card-icon h-9 w-9">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <span className="font-display text-base font-bold tracking-tight text-foreground">
            BonzStore
          </span>
          <span className="ml-1.5 rounded border border-primary/40 bg-primary/25 px-1.5 py-0.5 font-display text-[10px] font-bold uppercase text-foreground dark:text-primary">
            Anime
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-primary/20 bg-muted/50 p-3 text-xs">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <ShieldAlert className="h-4 w-4 text-foreground dark:text-primary" />
            <span>3-Layer RBAC Active</span>
          </div>
          <p className="mt-1 text-muted-foreground">
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
      </div>
    </aside>
  );
}
