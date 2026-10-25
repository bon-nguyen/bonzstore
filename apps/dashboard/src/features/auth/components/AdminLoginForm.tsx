import { AlertCircle, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminLogin } from '../hooks/useAuth';

export function AdminLoginForm() {
  const navigate = useNavigate();
  const loginMutation = useAdminLogin();

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
      <div className="mb-6 flex items-center gap-3">
        <div className="stat-card-icon">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="page-subtitle">BonzStore Admin</p>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Đăng nhập Quản trị viên
          </h1>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email Quản trị
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
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mật khẩu
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
          className="action-btn-primary w-full py-2.5"
        >
          <KeyRound className="h-4 w-4" />
          {loginMutation.isPending
            ? 'Đang xác thực quyền Admin...'
            : 'Đăng nhập vào Dashboard'}
        </button>
      </form>

      <div className="mt-6 border-t border-border pt-4">
        <p className="mb-2.5 text-xs font-medium text-muted-foreground">
          Tài khoản mẫu (RBAC Seed):
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@bonzstore.com', 'Admin@123')}
            className="action-btn-secondary py-1.5 text-xs"
          >
            Super Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('manager@bonzstore.com', 'Manager@123')}
            className="action-btn-secondary py-1.5 text-xs"
          >
            Store Manager
          </button>
          <button
            type="button"
            onClick={() =>
              fillDemoAccount('customer@bonzstore.com', 'Customer@123')
            }
            className="action-btn-secondary py-1.5 text-xs"
            title="Thử nghiệm bị chặn bởi Guard vì không có quyền Admin"
          >
            Customer (403)
          </button>
        </div>
      </div>
    </div>
  );
}

