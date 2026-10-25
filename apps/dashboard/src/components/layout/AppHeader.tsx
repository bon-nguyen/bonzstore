import { LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../features/auth/context/AuthContext';

export function AppHeader() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="status-badge status-active">
          <ShieldCheck className="h-3.5 w-3.5" />
          {user?.role?.code || 'ADMIN'}
        </span>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Hệ thống quản trị BonzStore (Tailwind Admin)
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-right">
          <UserCircle2 className="h-8 w-8 text-primary" />
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-foreground">
              {user?.fullName}
            </p>
            <p className="text-[11px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="action-btn-secondary px-3 py-1.5 text-xs"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}

