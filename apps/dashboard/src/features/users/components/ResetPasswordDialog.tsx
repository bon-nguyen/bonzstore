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
    toast.success(t('api.copiedPassword'));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned = trim(newPassword);
    if (isEmpty(cleaned) || cleaned.length < 6) {
      setError(t('users.validationPasswordLength'));
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
            <span>{t('users.resetModalTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
            <p className="font-semibold text-foreground">{user.fullName}</p>
            <p className="font-mono text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-300">
              {t('users.resetPasswordNotice')}
            </p>
          </div>

          <FormField
            label={t('users.newPasswordLabel')}
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
                title={t('users.generateRandomPass')}
              >
                <Sparkles className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title={t('users.copyPassword')}
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
              {t('users.confirmReset')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
