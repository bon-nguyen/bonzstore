import { LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../features/auth/context/AuthContext';
import { LanguageToggle, useI18n } from '../../features/i18n/I18nContext';
import { ThemeToggle } from '../../features/theme/ThemeContext';

export function AppHeader() {
  const { user, logout } = useAuthContext();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2.5">
        <span className="status-badge status-active font-display">
          <ShieldCheck className="h-3.5 w-3.5" />
          {user?.role?.code || 'ADMIN'}
        </span>
        <span className="hidden text-xs text-muted-foreground lg:inline">
          {t('app.header.subtitle')}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageToggle />
        <ThemeToggle />

        <div className="flex items-center gap-2 border-l border-border pl-2.5 text-right">
          <UserCircle2 className="h-8 w-8 text-foreground dark:text-primary" />
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
          <span className="hidden sm:inline">{t('app.logout')}</span>
        </button>
      </div>
    </header>
  );
}
