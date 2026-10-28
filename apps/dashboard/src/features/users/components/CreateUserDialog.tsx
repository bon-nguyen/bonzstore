import { isEmpty, trim } from 'lodash';
import { FormEvent, useState } from 'react';
import { RoleItem } from '../../../api/types/role.types';
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
import { canActorAssignRole } from '../../../lib/utils';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { useCreateUser } from '../hooks/useUsers';

export interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleItem[];
}

const INITIAL_FORM_STATE = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  roleIdOrCode: 'STAFF',
};

export function CreateUserDialog({
  open,
  onOpenChange,
  roles,
}: CreateUserDialogProps) {
  const { t } = useI18n();
  const { user: currentUser } = useAuthContext();
  const createUserMutation = useCreateUser();
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [validationError, setValidationError] = useState<string | null>(null);

  const actorRoleCode = currentUser?.role?.code;
  // Loại bỏ hoàn toàn SUPER_ADMIN khi thêm user mới vì SUPER_ADMIN là duy nhất
  const assignableRoles = roles.filter((r) =>
    canActorAssignRole(actorRoleCode, r.code),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanedEmail = trim(formState.email);
    const cleanedName = trim(formState.fullName);

    if (isEmpty(cleanedEmail) || isEmpty(cleanedName)) {
      setValidationError(t('users.validationNameEmail'));
      return;
    }

    if (!canActorAssignRole(actorRoleCode, formState.roleIdOrCode)) {
      setValidationError(t('users.validationRoleHierarchy'));
      return;
    }

    await createUserMutation.mutateAsync({
      ...formState,
      email: cleanedEmail,
      fullName: cleanedName,
    });
    onOpenChange(false);
    setFormState(INITIAL_FORM_STATE);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('users.modalTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {validationError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              {validationError}
            </p>
          ) : null}

          <FormField label={t('users.fullName')} required>
            <Input
              type="text"
              required
              value={formState.fullName}
              onChange={(e) =>
                setFormState({ ...formState, fullName: e.target.value })
              }
            />
          </FormField>

          <FormField label="Email" required>
            <Input
              type="email"
              required
              value={formState.email}
              onChange={(e) =>
                setFormState({ ...formState, email: e.target.value })
              }
            />
          </FormField>

          <FormField label={t('users.initPassword')} required>
            <Input
              type="password"
              required
              minLength={6}
              value={formState.password}
              onChange={(e) =>
                setFormState({ ...formState, password: e.target.value })
              }
            />
          </FormField>

          <FormField
            label={t('users.colRole')}
            required
            description={t('users.onlySuperAdminDesc')}
          >
            <Select
              value={formState.roleIdOrCode}
              onChange={(e) =>
                setFormState({ ...formState, roleIdOrCode: e.target.value })
              }
              options={assignableRoles.map((r) => ({
                value: r.code,
                label: `${r.name} (${r.code})`,
              }))}
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
            <Button type="submit" disabled={createUserMutation.isPending}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
