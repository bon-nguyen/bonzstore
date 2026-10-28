import { AlertCircle, KeyRound, Lock, Mail, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { FormField } from '../../../components/ui/form-field';
import { Input } from '../../../components/ui/input';
import { getErrorMessage } from '../../../lib/utils';
import { LanguageToggle, useI18n } from '../../i18n/I18nContext';
import { ThemeToggle } from '../../theme/ThemeContext';
import { useAdminLogin } from '../hooks/useAuth';

const DEMO_ACCOUNTS = [
  {
    labelKey: 'login.demoAdmin' as const,
    email: 'admin@bonzstore.com',
    pass: 'Admin@123',
    destructive: false,
  },
  {
    labelKey: 'login.demoManager' as const,
    email: 'manager@bonzstore.com',
    pass: 'Manager@123',
    destructive: false,
  },
  {
    labelKey: 'login.demoStaff' as const,
    email: 'staff@bonzstore.com',
    pass: 'Staff@123',
    destructive: false,
  },
  {
    labelKey: 'login.demoCustomer' as const,
    email: 'customer@bonzstore.com',
    pass: 'Customer@123',
    destructive: true,
  },
];

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
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, 'Đăng nhập thất bại'));
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
        <FormField label={t('login.email')} htmlFor="login-email" required>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bonzstore.com"
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField
          label={t('login.password')}
          htmlFor="login-password"
          required
        >
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
            />
          </div>
        </FormField>

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full"
        >
          <KeyRound className="h-4 w-4" />
          <span>
            {loginMutation.isPending ? t('login.submitting') : t('login.submit')}
          </span>
        </Button>
      </form>

      <div className="mt-6 border-t border-border pt-4">
        <p className="mb-2.5 text-xs font-medium text-muted-foreground">
          {t('login.demoTitle')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <Button
              key={acc.email}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillDemoAccount(acc.email, acc.pass)}
              className={
                acc.destructive
                  ? 'text-xs text-rose-500 dark:text-rose-400'
                  : 'text-xs'
              }
            >
              {t(acc.labelKey)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
