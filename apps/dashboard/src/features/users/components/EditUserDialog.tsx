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
import { canActorAssignRole, canActorManageRole } from '../../../lib/utils';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { useUpdateUser } from '../hooks/useUsers';

export interface EditUserDialogProps {
  user: UserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleItem[];
}

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
  const isTargetSuperAdmin = user.role?.code === 'SUPER_ADMIN';
  const assignableRoles = roles.filter((r) =>
    canActorAssignRole(actorRoleCode, r.code),
  );

  const statusOptions = [
    { value: 'ACTIVE', label: `ACTIVE (${t('status.ACTIVE')})` },
    { value: 'LOCKED', label: `LOCKED (${t('status.LOCKED')})` },
    { value: 'INACTIVE', label: `INACTIVE (${t('status.INACTIVE')})` },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanedName = trim(fullName);
    if (isEmpty(cleanedName)) {
      setValidationError(t('users.validationName'));
      return;
    }

    if (
      !isTargetSuperAdmin &&
      !canActorAssignRole(actorRoleCode, roleIdOrCode)
    ) {
      setValidationError(t('users.validationRoleHierarchy'));
      return;
    }

    await updateMutation.mutateAsync({
      id: user.id,
      data: {
        fullName: cleanedName,
        phone: trim(phone) || undefined,
        roleIdOrCode: isTargetSuperAdmin ? undefined : roleIdOrCode,
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
            <span>{t('users.editModalTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {validationError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              {validationError}
            </p>
          ) : null}

          <FormField label={t('users.emailReadonly')}>
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

          <FormField label={t('users.phone')}>
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
            description={t('users.onlySuperAdminDesc')}
          >
            {isTargetSuperAdmin ? (
              <Input
                type="text"
                value="Super Admin (SUPER_ADMIN — Duy nhất)"
                disabled
                className="font-mono opacity-70"
              />
            ) : (
              <Select
                value={roleIdOrCode}
                onChange={(e) => setRoleIdOrCode(e.target.value)}
                options={assignableRoles.map((r) => ({
                  value: r.code,
                  label: `${r.name} (${r.code})`,
                }))}
              />
            )}
          </FormField>

          <FormField label={t('app.status')} required>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              options={statusOptions}
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
