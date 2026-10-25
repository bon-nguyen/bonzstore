import { Lock, Unlock, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { UserItem, UserStatus } from '../api/types/user.types';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useRoles } from '../features/roles/hooks/useRoles';
import { PageHeader } from '../features/shared/PageHeader';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { StatusBadge } from '../features/shared/StatusBadge';
import {
  useCreateUser,
  useUpdateUser,
  useUsers,
} from '../features/users/hooks/useUsers';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: usersResponse, isLoading } = useUsers({
    search: search || undefined,
    status: statusFilter || undefined,
  });
  const { data: roles } = useRoles();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const [formState, setFormState] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    roleIdOrCode: 'STAFF',
  });

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    await createUserMutation.mutateAsync(formState);
    setShowCreateModal(false);
    setFormState({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      roleIdOrCode: 'STAFF',
    });
  };

  const handleToggleLock = (user: UserItem) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    updateUserMutation.mutate({
      id: user.id,
      data: { status: nextStatus },
    });
  };

  const handleChangeRole = (user: UserItem, newRoleCode: string) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { roleIdOrCode: newRoleCode },
    });
  };

  const columns: Column<UserItem>[] = [
    {
      key: 'user',
      header: 'Người dùng',
      isPrimary: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-foreground">{item.fullName}</p>
          <p className="text-xs text-muted-foreground">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò (RBAC Role)',
      render: (item) => (
        <PermissionGate
          permission="users.update"
          fallback={
            <span className="font-medium text-primary">
              {item.role?.name} ({item.role?.code})
            </span>
          }
        >
          <select
            value={item.role?.code || ''}
            onChange={(e) => handleChangeRole(item, e.target.value)}
            className="rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary"
          >
            {roles?.map((r) => (
              <option key={r.id} value={r.code}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </PermissionGate>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'permissions',
      header: 'Số quyền',
      render: (item) => (
        <span className="text-xs font-medium text-muted-foreground">
          {item.permissions?.length || 0} quyền
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (item) => (
        <PermissionGate permission="users.update">
          <button
            type="button"
            onClick={() => handleToggleLock(item)}
            className="table-action-btn"
            title={
              item.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'
            }
          >
            {item.status === 'ACTIVE' ? (
              <Lock className="h-4 w-4 text-rose-400" />
            ) : (
              <Unlock className="h-4 w-4 text-emerald-400" />
            )}
          </button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle="Identity & Access Management"
        title="Quản lý Người dùng"
        description="Phân công Vai trò (Role) và kiểm soát trạng thái tài khoản truy cập hệ thống"
        actions={
          <PermissionGate permission="users.create">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="action-btn-primary"
            >
              <UserPlus className="h-4 w-4" />
              <span>Thêm tài khoản</span>
            </button>
          </PermissionGate>
        }
      />

      <div className="filter-panel flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="flex-1 rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
          className="rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
          <option value="LOCKED">Đã khóa (LOCKED)</option>
          <option value="INACTIVE">Ngừng hoạt động (INACTIVE)</option>
        </select>
      </div>

      <ResponsiveTable
        columns={columns}
        data={usersResponse?.data || []}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
      />

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="stat-card w-full max-w-md space-y-4 p-6">
            <h2 className="text-lg font-bold">Tạo tài khoản mới</h2>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState({ ...formState, fullName: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) =>
                    setFormState({ ...formState, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Mật khẩu khởi tạo
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formState.password}
                  onChange={(e) =>
                    setFormState({ ...formState, password: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Vai trò (Role)
                </label>
                <select
                  value={formState.roleIdOrCode}
                  onChange={(e) =>
                    setFormState({ ...formState, roleIdOrCode: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  {roles?.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
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
                  disabled={createUserMutation.isPending}
                  className="action-btn-primary"
                >
                  {createUserMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

