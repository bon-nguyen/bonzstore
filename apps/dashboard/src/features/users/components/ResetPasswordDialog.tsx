import { isEmpty, trim } from 'lodash';
import { Copy, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserItem } from '../../../api/types/user.types';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { FormField } from '../../../components/ui/form-field';
import { Input } from '../../../components/ui/input';
import { useI18n } from '../../i18n/I18nContext';
import { useResetUserPassword } from '../hooks/useUsers';

export interface ResetPasswordDialogProps {
  user: UserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateRandomPassword(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `Bonz@${digits}`;
}

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: ResetPasswordDialogProps) {
  const { t } = useI18n();
  const resetMutation = useResetUserPassword();

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNewPassword(generateRandomPassword());
      setShowPassword(true);
      setError(null);
    }
  }, [open]);

  if (!user) return null;

  const handleCopy = async () => {
    if (isEmpty(trim(newPassword))) return;
    await navigator.clipboard.writeText(trim(newPassword));
    toast.success('Đã sao chép mật khẩu mới vào Clipboard');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned = trim(newPassword);
    if (isEmpty(cleaned) || cleaned.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    await resetMutation.mutateAsync({
      id: user.id,
      newPassword: cleaned,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-foreground dark:text-primary" />
            <span>Reset Password — Đặt lại mật khẩu</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
            <p className="font-semibold text-foreground">{user.fullName}</p>
            <p className="font-mono text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-300">
              Lưu ý: Đặt lại mật khẩu sẽ tự động thu hồi toàn bộ phiên đăng nhập
              cũ của tài khoản này.
            </p>
          </div>

          <FormField
            label="Mật khẩu mới (Tối thiểu 6 ký tự)"
            required
            error={error || undefined}
          >
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-9 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setNewPassword(generateRandomPassword())}
                title="Tạo mật khẩu ngẫu nhiên"
              >
                <Sparkles className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copy mật khẩu"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </FormField>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={resetMutation.isPending}>
              Xác nhận Reset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

