'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { WEB_TOKEN_KEY, webApiClient } from '../../lib/api-client';

export default function WebLoginPage() {
  const [email, setEmail] = useState('customer@bonzstore.com');
  const [password, setPassword] = useState('Customer@123');
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      webApiClient.post('/auth/login', payload) as Promise<any>,
    onSuccess: (res) => {
      localStorage.setItem(WEB_TOKEN_KEY, res.accessToken);
      setLoggedUser(res.user);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.message || 'Đăng nhập thất bại');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              BonzStore Web
            </p>
            <h1 className="text-xl font-bold">Đăng nhập Khách hàng</h1>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            ← Trang chủ
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        ) : null}

        {loggedUser ? (
          <div className="space-y-3 rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-sm">
            <p className="font-semibold text-teal-300">
              Đăng nhập thành công!
            </p>
            <p>Họ tên: {loggedUser.fullName}</p>
            <p>Role: {loggedUser.role?.name} ({loggedUser.role?.code})</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

