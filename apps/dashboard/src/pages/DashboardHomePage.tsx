import {
  Activity,
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
import { PageSectionContainer } from '../features/shared/PageSectionContainer';
import { StatCard } from '../features/shared/StatCard';
import { StatusBadge } from '../features/shared/StatusBadge';
import { useUserStats } from '../features/users/hooks/useUsers';

export function DashboardHomePage() {
  const { user } = useAuthContext();
  const { t } = useI18n();
  const { data: userStats } = useUserStats();
  const { data: roles } = useRoles();

  return (
    <div className="page-container">
      <PageHeader
        subtitle={t('home.subtitle')}
        title={`${t('home.welcome')}, ${user?.fullName || 'Admin'}`}
        badge={user?.role?.code || 'ADMIN'}
        description={t('home.desc')}
        actions={
          <Link to="/roles" className="action-btn-primary">
            <KeyRound className="h-4 w-4" />
            <span>{t('home.configRbac')}</span>
          </Link>
        }
      />

      {/* Section 1: Thống kê tổng quan nhân sự & phân quyền */}
      <PageSectionContainer
        title="Tổng quan Chỉ số Hệ thống"
        subBadge="System KPIs & RBAC Overview"
        description="Theo dõi số lượng tài khoản hoạt động, đội ngũ quản trị và cấu trúc vai trò hiện hành"
        icon={Activity}
      >
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
      </PageSectionContainer>

      {/* Section 2: Thông tin phiên đăng nhập & quyền hạn được cấp */}
      <PageSectionContainer
        title={t('home.sessionTitle')}
        subBadge="Active Session & Permissions"
        description={t('home.sessionSub')}
        icon={ShieldCheck}
        headerRight={<StatusBadge status={user?.status || 'ACTIVE'} />}
        bodyClassName="space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/20 p-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-xs text-muted-foreground">Email:</span>
            <p className="mt-0.5 font-mono font-medium">{user?.email}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              {t('home.roleLabel')}
            </span>
            <p className="mt-0.5 font-semibold text-foreground dark:text-primary">
              {user?.role?.name} ({user?.role?.code})
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              {t('home.portalLabel')}
            </span>
            <p className="mt-0.5 font-medium">
              {user?.role?.isAdminPanel
                ? t('home.portalAllowed')
                : t('home.portalRestricted')}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2.5 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
      </PageSectionContainer>
    </div>
  );
}
