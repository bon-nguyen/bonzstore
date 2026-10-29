import { KeyRound } from 'lucide-react';
import { PermissionItem, RoleItem } from '../../../api/types/role.types';
import { Switch } from '../../../components/ui/switch';
import { useI18n } from '../../i18n/I18nContext';
import { PageSectionContainer } from '../../shared/PageSectionContainer';

export interface RolePermissionMatrixProps {
  role: RoleItem;
  permissions: PermissionItem[];
  canManageRoles: boolean;
  onTogglePermission: (role: RoleItem, permCode: string) => void;
}

export function RolePermissionMatrix({
  role,
  permissions,
  canManageRoles,
  onTogglePermission,
}: RolePermissionMatrixProps) {
  const { t } = useI18n();

  return (
    <PageSectionContainer
      title={`${t('roles.matrixTitle')}: ${role.name}`}
      subBadge={role.code}
      description={t('roles.matrixDesc')}
      icon={KeyRound}
      headerRight={
        <span className="status-badge status-active">
          {role.isAdminPanel ? t('users.portalYes') : t('users.portalNo')}
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {permissions.map((perm) => {
          const checked = role.permissionCodes.includes(perm.code);
          return (
            <div
              key={perm.id}
              className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 transition ${
                checked
                  ? 'border-primary bg-primary/15'
                  : 'border-border bg-muted/20 hover:bg-muted/35'
              }`}
            >
              <div className="text-xs">
                <p className="font-semibold text-foreground">{perm.name}</p>
                <p className="font-mono text-[11px] text-foreground/80 dark:text-primary">
                  {perm.code}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {perm.description}
                </p>
              </div>

              <Switch
                checked={checked}
                disabled={!canManageRoles}
                onCheckedChange={() => onTogglePermission(role, perm.code)}
              />
            </div>
          );
        })}
      </div>
    </PageSectionContainer>
  );
}
