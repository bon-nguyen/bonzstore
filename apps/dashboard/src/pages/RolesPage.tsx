import { Check, Plus, Shield } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { RoleItem } from '../api/types/role.types';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import {
  useCreateRole,
  usePermissionsCatalog,
  useRoles,
  useUpdateRole,
} from '../features/roles/hooks/useRoles';
import { PageHeader } from '../features/shared/PageHeader';
import { StatusBadge } from '../features/shared/StatusBadge';

export function RolesPage() {
  const { data: roles, isLoading } = useRoles();
  const { data: permissions } = usePermissionsCatalog();
  const updateRoleMutation = useUpdateRole();
  const createRoleMutation = useCreateRole();

  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({
    code: '',
    name: '',
    description: '',
    isAdminPanel: true,
  });

  const activeRole = selectedRole
    ? roles?.find((r) => r.id === selectedRole.id) || selectedRole
    : roles?.[0] || null;

  const handleTogglePermission = (role: RoleItem, permCode: string) => {
    const exists = role.permissionCodes.includes(permCode);
    const nextCodes = exists
      ? role.permissionCodes.filter((c) => c !== permCode)
      : [...role.permissionCodes, permCode];

    updateRoleMutation.mutate({
      id: role.id,
      data: { permissionCodes: nextCodes },
    });
  };

  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault();
    await createRoleMutation.mutateAsync({
      ...newRole,
      permissionCodes: ['dashboard.view'],
    });
    setShowCreateModal(false);
    setNewRole({ code: '', name: '', description: '', isAdminPanel: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle="Role-Based Access Control (RBAC)"
        title="Vai trò & Ma trận Phân quyền"
        description="Quản lý động các Role và gán từng Permission chi tiết cho Admin/Nhân viên"
        actions={
          <PermissionGate permission="roles.manage">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="action-btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo Vai trò mới</span>
            </button>
          </PermissionGate>
        }
      />

      {isLoading ? (
        <div className="stat-card p-8 text-center text-sm text-muted-foreground">
          Đang tải danh sách vai trò và quyền hạn...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Roles List */}
          <div className="space-y-3 lg:col-span-4">
            {roles?.map((role) => {
              const isSelected = activeRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`stat-card w-full text-left transition ${
                    isSelected ? 'border-primary ring-1 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-bold text-foreground">
                        {role.name}
                      </span>
                    </div>
                    <StatusBadge status={role.status} />
                  </div>
                  <p className="mt-1 font-mono text-xs text-primary">
                    {role.code}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {role.description || 'Không có mô tả'}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                    <span>{role.userCount} tài khoản</span>
                    <span>{role.permissionCodes.length} quyền</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Permission Matrix for Selected Role */}
          <div className=" lg:col-span-8">
            {activeRole ? (
              <div className="stat-card space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-bold">
                      Ma trận Quyền hạn: {activeRole.name} ({activeRole.code})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Bật/tắt các quyền hạn bên dưới để cập nhật tức thì vào cơ sở dữ liệu
                    </p>
                  </div>
                  <span className="status-badge status-active">
                    {activeRole.isAdminPanel ? 'Cho phép vào Admin' : 'Storefront Only'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {permissions?.map((perm) => {
                    const checked = activeRole.permissionCodes.includes(perm.code);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(activeRole, perm.code)}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
                          checked
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-border bg-muted/20 hover:bg-muted/40'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            checked
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card'
                          }`}
                        >
                          {checked ? <Check className="h-3.5 w-3.5" /> : null}
                        </div>
                        <div className="text-xs">
                          <p className="font-semibold text-foreground">
                            {perm.name}
                          </p>
                          <p className="font-mono text-[11px] text-primary">
                            {perm.code}
                          </p>
                          <p className="mt-0.5 text-muted-foreground">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="stat-card w-full max-w-md space-y-4 p-6">
            <h2 className="text-lg font-bold">Tạo Vai trò (Role) mới</h2>
            <form onSubmit={handleCreateRole} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Mã Role (Viết hoa, không dấu)
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: WAREHOUSE_MANAGER"
                  value={newRole.code}
                  onChange={(e) =>
                    setNewRole({ ...newRole, code: e.target.value.toUpperCase() })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Quản lý kho"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Mô tả
                </label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="action-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createRoleMutation.isPending}
                  className="action-btn-primary"
                >
                  {createRoleMutation.isPending ? 'Đang lưu...' : 'Tạo Vai trò'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

