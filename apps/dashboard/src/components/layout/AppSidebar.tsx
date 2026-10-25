import {
  KeyRound,
  LayoutDashboard,
  ShieldAlert,
  Store,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../features/auth/context/AuthContext';
import { cn } from '../../lib/utils';

export const ADMIN_NAV_ITEMS = [
  {
    to: '/',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    permission: 'dashboard.view',
  },
  {
    to: '/users',
    label: 'Người dùng',
    icon: Users,
    permission: 'users.read',
  },
  {
    to: '/roles',
    label: 'Phân quyền RBAC',
    icon: KeyRound,
    permission: 'roles.read',
  },
];

export function AppSidebar() {
  const { hasPermission, user } = useAuthContext();

  const visibleItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="stat-card-icon h-9 w-9">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-foreground">
            BonzStore
          </span>
          <span className="ml-1.5 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
            Admin
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
                  'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-muted/50 p-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <span>RBAC Active</span>
          </div>
          <p className="mt-1 text-muted-foreground">
            Role: <strong className="text-foreground">{user?.role?.name}</strong>
          </p>
          <p className="text-muted-foreground">
            Quyền hạn: <strong className="text-primary">{user?.permissions?.length || 0}</strong>
          </p>
        </div>
      </div>
    </aside>
  );
}

