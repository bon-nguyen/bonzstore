'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { webApiClient } from '../lib/api-client';

export default function StorefrontHomePage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['api-health'],
    queryFn: () =>
      webApiClient.get('/health') as Promise<{
        status: string;
        service: string;
        database: string;
      }>,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-teal-400">
              BonzStore
            </span>
            <span className="rounded bg-teal-500/15 px-2 py-0.5 text-xs font-medium text-teal-300">
              Next.js Web
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500"
            >
              Đăng nhập Khách hàng
            </Link>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Mở Admin Dashboard (5173)
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">
            BonzStore Monorepo Architecture
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Storefront Web (Next.js + TailwindCSS + React Query)
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Ứng dụng khách hàng kết nối chung tới NestJS API (cổng 4000), tách biệt quyền hạn với trang quản trị Admin Dashboard (Vite + Tailwind Admin tại cổng 5173).
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">Trạng thái NestJS API</p>
              <p className="mt-1 text-lg font-semibold text-teal-400">
                {isLoading ? 'Đang kiểm tra...' : health?.status?.toUpperCase() || 'OFFLINE'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">PostgreSQL (Prisma)</p>
              <p className="mt-1 text-lg font-semibold">
                {isLoading ? '...' : health?.database || 'disconnected'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">Phân quyền (RBAC)</p>
              <p className="mt-1 text-lg font-semibold text-emerald-400">
                Role & Permission Active
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

