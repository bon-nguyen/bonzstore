import { AlertCircle, KeyRound, Lock, Mail, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageToggle, useI18n } from '../../i18n/I18nContext';
import { ThemeToggle } from '../../theme/ThemeContext';
import { useAdminLogin } from '../hooks/useAuth';

export function AdminLoginForm() {
  const navigate = useNavigate();
  const loginMutation = useAdminLogin();
  const { t } = useI18n();

  const [email, setEmail] = useState('admin@bonzstore.com');
  const [password, setPassword] = useState('Admin@123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await loginMutation.mutateAsync({ email, password });
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đăng nhập thất bại');
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="stat-card w-full max-w-md p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="stat-card-icon">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="page-subtitle">{t('login.subtitle')}</p>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
              {t('login.title')}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('login.email')}
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bonzstore.com"
              className="w-full rounded-lg border border-border bg-muted/40 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('login.password')}
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-muted/40 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="action-btn-primary w-full py-2.5 font-display"
        >
          <KeyRound className="h-4 w-4" />
          {loginMutation.isPending ? t('login.submitting') : t('login.submit')}
        </button>
      </form>

      <div className="mt-6 border-t border-border pt-4">
        <p className="mb-2.5 text-xs font-medium text-muted-foreground">
          {t('login.demoTitle')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@bonzstore.com', 'Admin@123')}
            className="action-btn-secondary py-1.5 text-xs"
          >
            {t('login.demoAdmin')}
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('manager@bonzstore.com', 'Manager@123')}
            className="action-btn-secondary py-1.5 text-xs"
          >
            {t('login.demoManager')}
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('staff@bonzstore.com', 'Staff@123')}
            className="action-btn-secondary py-1.5 text-xs"
          >
            {t('login.demoStaff')}
          </button>
          <button
            type="button"
            onClick={() =>
              fillDemoAccount('customer@bonzstore.com', 'Customer@123')
            }
            className="action-btn-secondary py-1.5 text-xs text-rose-500 dark:text-rose-400"
          >
            {t('login.demoCustomer')}
          </button>
        </div>
      </div>
    </div>
  );
}
