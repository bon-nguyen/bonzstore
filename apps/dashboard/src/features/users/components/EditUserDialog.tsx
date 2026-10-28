import { isEmpty, trim } from 'lodash';
import { Pencil } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { RoleItem } from '../../../api/types/role.types';
import { UserItem, UserStatus } from '../../../api/types/user.types';
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
import { Select } from '../../../components/ui/select';
import { canActorManageRole } from '../../../lib/utils';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { useUpdateUser } from '../hooks/useUsers';

export interface EditUserDialogProps {
  user: UserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleItem[];
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE (Đang hoạt động)' },
  { value: 'LOCKED', label: 'LOCKED (Đã khóa)' },
  { value: 'INACTIVE', label: 'INACTIVE (Tạm ẩn)' },
];

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  roles,
}: EditUserDialogProps) {
  const { t } = useI18n();
  const { user: currentUser } = useAuthContext();
  const updateMutation = useUpdateUser();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [roleIdOrCode, setRoleIdOrCode] = useState('STAFF');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName || '');
      setPhone(user.phone && !user.phone.includes('*') ? user.phone : '');
      setRoleIdOrCode(user.role?.code || 'STAFF');
      setStatus(user.status || 'ACTIVE');
      setValidationError(null);
    }
  }, [user, open]);

  if (!user) return null;

  const actorRoleCode = currentUser?.role?.code;
  const assignableRoles = roles.filter((r) =>
    canActorManageRole(actorRoleCode, r.code),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanedName = trim(fullName);
    if (isEmpty(cleanedName)) {
      setValidationError('Họ và tên không được để trống');
      return;
    }

    if (!canActorManageRole(actorRoleCode, roleIdOrCode)) {
      setValidationError(
        'Bạn không có thẩm quyền gán vai trò này (Chỉ SUPER_ADMIN)',
      );
      return;
    }

    await updateMutation.mutateAsync({
      id: user.id,
      data: {
        fullName: cleanedName,
        phone: trim(phone) || undefined,
        roleIdOrCode,
        status,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-foreground dark:text-primary" />
            <span>Chỉnh sửa tài khoản</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {validationError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              {validationError}
            </p>
          ) : null}

          <FormField label="Email (Không thể thay đổi)">
            <Input
              type="text"
              value={user.email}
              disabled
              className="font-mono opacity-70"
            />
          </FormField>

          <FormField label={t('users.fullName')} required>
            <Input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormField>

          <FormField label="Số điện thoại">
            <Input
              type="text"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormField>

          <FormField
            label={t('users.colRole')}
            required
            description={
              actorRoleCode !== 'SUPER_ADMIN'
                ? 'Chỉ SUPER_ADMIN mới được phép nâng quyền lên SUPER_ADMIN'
                : undefined
            }
          >
            <Select
              value={roleIdOrCode}
              onChange={(e) => setRoleIdOrCode(e.target.value)}
              options={assignableRoles.map((r) => ({
                value: r.code,
                label: `${r.name} (${r.code})`,
              }))}
            />
          </FormField>

          <FormField label={t('app.status')} required>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              options={STATUS_OPTIONS}
            />
          </FormField>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

