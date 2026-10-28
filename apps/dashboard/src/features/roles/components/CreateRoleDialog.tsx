import { FormEvent, useState } from 'react';
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
import { Switch } from '../../../components/ui/switch';
import { useI18n } from '../../i18n/I18nContext';
import { useCreateRole } from '../hooks/useRoles';

export interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_ROLE_STATE = {
  code: '',
  name: '',
  description: '',
  isAdminPanel: true,
};

export function CreateRoleDialog({
  open,
  onOpenChange,
}: CreateRoleDialogProps) {
  const { t } = useI18n();
  const createRoleMutation = useCreateRole();
  const [newRole, setNewRole] = useState(INITIAL_ROLE_STATE);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createRoleMutation.mutateAsync({
      ...newRole,
      permissionCodes: ['dashboard.view'],
    });
    onOpenChange(false);
    setNewRole(INITIAL_ROLE_STATE);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('roles.addBtn')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label={t('roles.codeLabel')} required>
            <Input
              type="text"
              required
              placeholder="ANIME_CURATOR"
              value={newRole.code}
              onChange={(e) =>
                setNewRole({ ...newRole, code: e.target.value.toUpperCase() })
              }
            />
          </FormField>

          <FormField label={t('roles.nameLabel')} required>
            <Input
              type="text"
              required
              placeholder="Nhân viên Phụ trách Figure"
              value={newRole.name}
              onChange={(e) =>
                setNewRole({ ...newRole, name: e.target.value })
              }
            />
          </FormField>

          <FormField label={t('roles.descLabel')}>
            <Input
              type="text"
              value={newRole.description}
              onChange={(e) =>
                setNewRole({ ...newRole, description: e.target.value })
              }
            />
          </FormField>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-xs font-medium">
              {t('roles.isAdminPanelLabel')}
            </span>
            <Switch
              checked={newRole.isAdminPanel}
              onCheckedChange={(checked) =>
                setNewRole({ ...newRole, isAdminPanel: checked })
              }
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={createRoleMutation.isPending}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
