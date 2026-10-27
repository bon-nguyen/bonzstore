import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../features/auth/context/AuthContext';
import { useI18n } from '../../features/i18n/I18nContext';
import { cn } from '../../lib/utils';
import { ADMIN_NAV_ITEMS } from './AppSidebar';

export function BottomNav() {
  const { hasPermission } = useAuthContext();
  const { t } = useI18n();
  const visibleItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-card md:hidden">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-2 py-1.5 text-[11px] font-semibold',
                isActive
                  ? 'text-foreground dark:text-primary'
                  : 'text-muted-foreground',
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
