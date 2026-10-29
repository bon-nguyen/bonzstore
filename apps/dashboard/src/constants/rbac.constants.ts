export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  STORE_MANAGER: 'STORE_MANAGER',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_MANAGER_ROLES: RoleCode[] = [
  ROLES.SUPER_ADMIN,
  ROLES.STORE_MANAGER,
];

export const ROLE_RANK: Record<string, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.STORE_MANAGER]: 50,
  [ROLES.STAFF]: 20,
  [ROLES.CUSTOMER]: 10,
};

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  ROLES_READ: 'roles.read',
  ROLES_MANAGE: 'roles.manage',
  PRODUCTS_READ: 'products.read',
  PRODUCTS_MANAGE: 'products.manage',
  PRODUCTS_SYNC: 'products.sync',
  ORDERS_READ: 'orders.read',
  ORDERS_MANAGE: 'orders.manage',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

