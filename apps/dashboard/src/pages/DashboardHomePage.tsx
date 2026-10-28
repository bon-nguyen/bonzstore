import {
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { useI18n } from '../features/i18n/I18nContext';
import { useRoles } from '../features/roles/hooks/useRoles';
import { PageHeader } from '../features/shared/PageHeader';
import { StatCard } from '../features/shared/StatCard';
import { StatusBadge } from '../features/shared/StatusBadge';
import { useUserStats } from '../features/users/hooks/useUsers';

export function DashboardHomePage() {
  const { user } = useAuthContext();
  const { t } = useI18n();
  const { data: userStats } = useUserStats();
  const { data: roles } = useRoles();

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle={t('home.subtitle')}
        title={`${t('home.welcome')}, ${user?.fullName || 'Admin'}`}
        description={t('home.desc')}
        actions={
          <Link to="/roles" className="action-btn-primary">
            <KeyRound className="h-4 w-4" />
            <span>{t('home.configRbac')}</span>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('home.totalUsers')}
          value={userStats?.total ?? '—'}
          icon={Users}
        />
        <StatCard
          label={t('home.activeUsers')}
          value={userStats?.active ?? '—'}
          icon={CheckCircle2}
          highlight
        />
        <StatCard
          label={t('home.adminStaff')}
          value={userStats?.adminUsers ?? '—'}
          icon={ShieldCheck}
        />
        <StatCard
          label={t('home.totalRoles')}
          value={roles?.length ?? '—'}
          icon={Lock}
        />
      </div>

      <div className="stat-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="font-display text-base font-bold">
              {t('home.sessionTitle')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('home.sessionSub')}
            </p>
          </div>
          <StatusBadge status={user?.status || 'ACTIVE'} />
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-xs text-muted-foreground">Email:</span>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              {t('home.roleLabel')}
            </span>
            <p className="font-semibold text-foreground dark:text-primary">
              {user?.role?.name} ({user?.role?.code})
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              {t('home.portalLabel')}
            </span>
            <p className="font-medium">
              {user?.role?.isAdminPanel
                ? t('home.portalAllowed')
                : t('home.portalRestricted')}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('home.grantedPerms')} ({user?.permissions?.length || 0}):
          </p>
          <div className="flex flex-wrap gap-2">
            {user?.permissions?.map((code) => (
              <span
                key={code}
                className="status-badge status-active font-mono text-xs"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
