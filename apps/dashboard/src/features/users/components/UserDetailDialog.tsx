import {
  Calendar,
  Clock,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { UserItem } from '../../../api/types/user.types';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { canActorManageRole } from '../../../lib/utils';
import { PermissionGate } from '../../auth/components/PermissionGate';
import { useAuthContext } from '../../auth/context/AuthContext';
import { StatusBadge } from '../../shared/StatusBadge';
import { useUserDetail } from '../hooks/useUsers';

export interface UserDetailDialogProps {
  user: UserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestEdit: (user: UserItem) => void;
  onRequestResetPassword: (user: UserItem) => void;
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'Chưa có dữ liệu';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
  onRequestEdit,
  onRequestResetPassword,
}: UserDetailDialogProps) {
  const { user: currentUser } = useAuthContext();
  const { data: fetchedDetail } = useUserDetail(open ? user?.id : null);

  const detail = fetchedDetail || user;
  if (!detail) return null;

  const actorRoleCode = currentUser?.role?.code;
  const canManage =
    detail.canManage !== false &&
    canActorManageRole(actorRoleCode, detail.role?.code);

  const initials = detail.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2 pr-6">
            <span>Hồ sơ chi tiết tài khoản</span>
            <StatusBadge status={detail.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Top Profile Banner */}
          <div className="flex items-center gap-3.5 rounded-xl border border-border bg-muted/30 p-3.5">
            <div className="stat-card-icon h-12 w-12 shrink-0 font-display text-base font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-display text-base font-bold text-foreground">
                  {detail.fullName}
                </h3>
                {detail.isEmailMasked ? (
                  <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-300">
                    <ShieldAlert className="h-3 w-3" />
                    Email Hashed (Cấp cao hơn)
                  </span>
                ) : null}
              </div>
              <p className="truncate font-mono text-xs text-muted-foreground">
                ID: {detail.id}
              </p>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Email đăng nhập
              </span>
              <p className="mt-1 break-all font-mono font-semibold text-foreground">
                {detail.email}
              </p>
            </div>

            <div className="rounded-lg border border-border p-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                Số điện thoại
              </span>
              <p className="mt-1 font-mono font-semibold text-foreground">
                {detail.phone || 'Chưa cập nhật'}
              </p>
            </div>

            <div className="rounded-lg border border-border p-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Vai trò (RBAC Role)
              </span>
              <p className="mt-1 font-display font-bold text-foreground dark:text-primary">
                {detail.role?.name} ({detail.role?.code})
              </p>
            </div>

            <div className="rounded-lg border border-border p-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <UserCheck className="h-3.5 w-3.5" />
                Quyền cổng & Phiên hoạt động
              </span>
              <p className="mt-1 font-semibold text-foreground">
                {detail.role?.isAdminPanel
                  ? 'Cho phép vào Admin'
                  : 'Chỉ Web Storefront'}{' '}
                •{' '}
                <span className="font-mono text-foreground dark:text-primary">
                  {detail.activeSessions ?? 0} phiên
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-border p-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Ngày tạo tài khoản
              </span>
              <p className="mt-1 font-medium text-foreground">
                {formatDateTime(detail.createdAt)}
              </p>
            </div>

            <div className="rounded-lg border border-border p-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Đăng nhập gần nhất
              </span>
              <p className="mt-1 font-medium text-foreground">
                {formatDateTime(detail.lastLoginAt)}
              </p>
            </div>
          </div>

          {/* Permissions Matrix Summary */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Danh sách quyền được cấp ({detail.permissions?.length || 0} quyền)
            </p>
            {detail.permissions?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {detail.permissions.map((permCode) => (
                  <span
                    key={permCode}
                    className="status-badge status-active font-mono text-[11px]"
                  >
                    {permCode}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Không có quyền quản trị (Tài khoản Khách hàng Storefront).
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2 pt-2">
          {canManage ? (
            <PermissionGate permission="users.update">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onRequestResetPassword(detail);
                }}
              >
                <KeyRound className="h-4 w-4" />
                <span>Reset Password</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onRequestEdit(detail);
                }}
              >
                <Pencil className="h-4 w-4" />
                <span>Chỉnh sửa</span>
              </Button>
            </PermissionGate>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

