import { ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="stat-card max-w-md space-y-4 p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
          <ShieldOff className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">403 — Không đủ quyền truy cập</h1>
        <p className="text-sm text-muted-foreground">
          Tài khoản của bạn không có quyền hạn (Permission) cần thiết để thực hiện thao tác hoặc truy cập trang này.
        </p>
        <Link to="/" className="action-btn-primary inline-flex">
          Quay lại Trang tổng quan
        </Link>
      </div>
    </div>
  );
}

