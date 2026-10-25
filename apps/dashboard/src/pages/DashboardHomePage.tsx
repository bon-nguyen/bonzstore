import { CheckCircle2, KeyRound, Lock, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { useRoles } from '../features/roles/hooks/useRoles';
import { PageHeader } from '../features/shared/PageHeader';
import { StatusBadge } from '../features/shared/StatusBadge';
import { useUserStats } from '../features/users/hooks/useUsers';

export function DashboardHomePage() {
  const { user } = useAuthContext();
  const { data: userStats } = useUserStats();
  const { data: roles } = useRoles();

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle="Authentication & Authorization Center"
        title={`Xin chào, ${user?.fullName || 'Quản trị viên'}`}
        description="Hệ thống quản trị BonzStore với phân quyền RBAC động (Role-Based Access Control)"
        actions={
          <Link to="/roles" className="action-btn-primary">
            <KeyRound className="h-4 w-4" />
            <span>Cấu hình RBAC</span>
          </Link>
        }
      />

      {/* Metric Cards using .stat-card & .stat-card-icon */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Tổng tài khoản
            </p>
            <p className="mt-1 text-2xl font-bold">{userStats?.total ?? '—'}</p>
          </div>
          <div className="stat-card-icon">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Đang hoạt động
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {userStats?.active ?? '—'}
            </p>
          </div>
          <div className="stat-card-icon">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Nhân sự Admin Panel
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {userStats?.adminUsers ?? '—'}
            </p>
          </div>
          <div className="stat-card-icon">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Vai trò (Roles)
            </p>
            <p className="mt-1 text-2xl font-bold">{roles?.length ?? '—'}</p>
          </div>
          <div className="stat-card-icon">
            <Lock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Current Session RBAC Profile */}
      <div className="stat-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold">
              Phiên đăng nhập & Quyền hạn hiện tại của bạn
            </h2>
            <p className="text-xs text-muted-foreground">
              Dữ liệu lấy trực tiếp từ JWT Guard & endpoint <code>GET /api/auth/me</code>
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
            <span className="text-xs text-muted-foreground">Vai trò (Role):</span>
            <p className="font-semibold text-primary">
              {user?.role?.name} ({user?.role?.code})
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              Quyền truy cập Admin Panel:
            </span>
            <p className="font-medium">
              {user?.role?.isAdminPanel ? 'Được phép (isAdminPanel = true)' : 'Hạn chế'}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Danh sách Permissions được cấp ({user?.permissions?.length || 0}):
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

