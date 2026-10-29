import { Plus, Shield } from 'lucide-react';
import { useState } from 'react';
import { RoleItem } from '../api/types/role.types';
import { Button } from '../components/ui/button';
import { LoadingState } from '../components/ui/empty-state';
import { PERMISSIONS } from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { useI18n } from '../features/i18n/I18nContext';
import { CreateRoleDialog } from '../features/roles/components/CreateRoleDialog';
import { RolePermissionMatrix } from '../features/roles/components/RolePermissionMatrix';
import {
  usePermissionsCatalog,
  useRoles,
  useUpdateRole,
} from '../features/roles/hooks/useRoles';
import { PageHeader } from '../features/shared/PageHeader';
import { PageSectionContainer } from '../features/shared/PageSectionContainer';
import { StatusBadge } from '../features/shared/StatusBadge';

export function RolesPage() {
  const { hasPermission } = useAuthContext();
  const { t } = useI18n();
  const canManageRoles = hasPermission(PERMISSIONS.ROLES_MANAGE);
  const { data: roles = [], isLoading } = useRoles();
  const { data: permissions = [] } = usePermissionsCatalog();
  const updateRoleMutation = useUpdateRole();

  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeRole = selectedRole
    ? roles.find((r) => r.id === selectedRole.id) || selectedRole
    : roles[0] || null;

  const handleTogglePermission = (role: RoleItem, permCode: string) => {
    if (!canManageRoles) return;
    const exists = role.permissionCodes.includes(permCode);
    const nextCodes = exists
      ? role.permissionCodes.filter((c) => c !== permCode)
      : [...role.permissionCodes, permCode];

    updateRoleMutation.mutate({
      id: role.id,
      data: { permissionCodes: nextCodes },
    });
  };

  return (
    <div className="page-container">
      <PageHeader
        subtitle={t('roles.subtitle')}
        title={t('roles.title')}
        badge={`${roles.length} Roles • ${permissions.length} Permissions`}
        description={t('roles.desc')}
        actions={
          <PermissionGate permission={PERMISSIONS.ROLES_MANAGE}>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              <span>{t('roles.addBtn')}</span>
            </Button>
          </PermissionGate>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-4">
            <PageSectionContainer
              title="Danh sách Vai trò"
              subBadge="System Roles"
              description="Chọn một vai trò bên dưới để xem và cấu hình ma trận quyền hạn"
              icon={Shield}
              bodyClassName="space-y-3 p-4"
            >
              {roles.map((role) => {
                const isSelected = activeRole?.id === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm'
                        : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-foreground dark:text-primary" />
                        <span className="font-display font-bold text-foreground">
                          {role.name}
                        </span>
                      </div>
                      <StatusBadge status={role.status} />
                    </div>
                    <p className="mt-1 font-mono text-xs text-foreground/80 dark:text-primary">
                      {role.code}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {role.description || '—'}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                      <span>
                        {role.userCount} {t('roles.accountsCount')}
                      </span>
                      <span>
                        {role.permissionCodes.length} {t('roles.permsCount')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </PageSectionContainer>
          </div>

          <div className="lg:col-span-8">
            {activeRole ? (
              <RolePermissionMatrix
                role={activeRole}
                permissions={permissions}
                canManageRoles={canManageRoles}
                onTogglePermission={handleTogglePermission}
              />
            ) : null}
          </div>
        </div>
      )}

      <CreateRoleDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
