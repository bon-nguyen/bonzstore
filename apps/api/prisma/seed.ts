import { PrismaClient, RoleStatus, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PERMISSIONS = [
  { code: 'dashboard.view', name: 'Xem trang tổng quan Admin', module: 'DASHBOARD', description: 'Truy cập vào trang quản trị hệ thống' },
  { code: 'users.read', name: 'Xem danh sách người dùng', module: 'USERS', description: 'Xem danh sách và chi tiết tài khoản' },
  { code: 'users.create', name: 'Tạo người dùng mới', module: 'USERS', description: 'Thêm tài khoản quản trị hoặc nhân viên' },
  { code: 'users.update', name: 'Cập nhật người dùng', module: 'USERS', description: 'Chỉnh sửa thông tin, khóa/mở khóa tài khoản' },
  { code: 'users.delete', name: 'Xóa người dùng', module: 'USERS', description: 'Xóa tài khoản khỏi hệ thống' },
  { code: 'roles.read', name: 'Xem vai trò & phân quyền', module: 'ROLES', description: 'Xem danh sách Role và ma trận Permission' },
  { code: 'roles.manage', name: 'Quản lý vai trò & phân quyền', module: 'ROLES', description: 'Tạo, sửa Role và gán quyền hạn động' },
  { code: 'products.read', name: 'Xem sản phẩm', module: 'PRODUCTS', description: 'Xem danh mục và sản phẩm trong cửa hàng' },
  { code: 'products.manage', name: 'Quản lý sản phẩm', module: 'PRODUCTS', description: 'Thêm, sửa, xóa sản phẩm và tồn kho' },
  { code: 'orders.read', name: 'Xem đơn hàng', module: 'ORDERS', description: 'Xem danh sách đơn hàng của khách' },
  { code: 'orders.manage', name: 'Xử lý đơn hàng', module: 'ORDERS', description: 'Cập nhật trạng thái và duyệt đơn hàng' },
];

async function main() {
  console.log('🌱 Starting RBAC & Admin seed...');

  // 1. Upsert Permissions
  const permissionMap = new Map<string, string>();
  for (const perm of DEFAULT_PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module, description: perm.description },
      create: perm,
    });
    permissionMap.set(record.code, record.id);
  }

  // 2. Upsert Roles
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: { name: 'Super Admin', isSystem: true, isAdminPanel: true, status: RoleStatus.ACTIVE },
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Toàn quyền quản trị hệ thống BonzStore',
      isSystem: true,
      isAdminPanel: true,
      status: RoleStatus.ACTIVE,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { code: 'STORE_MANAGER' },
    update: { name: 'Quản lý cửa hàng', isSystem: true, isAdminPanel: true, status: RoleStatus.ACTIVE },
    create: {
      code: 'STORE_MANAGER',
      name: 'Quản lý cửa hàng',
      description: 'Quản lý sản phẩm, đơn hàng và nhân viên',
      isSystem: true,
      isAdminPanel: true,
      status: RoleStatus.ACTIVE,
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { code: 'STAFF' },
    update: { name: 'Nhân viên vận hành', isSystem: true, isAdminPanel: true, status: RoleStatus.ACTIVE },
    create: {
      code: 'STAFF',
      name: 'Nhân viên vận hành',
      description: 'Xử lý đơn hàng và kiểm tra sản phẩm',
      isSystem: true,
      isAdminPanel: true,
      status: RoleStatus.ACTIVE,
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { code: 'CUSTOMER' },
    update: { name: 'Khách hàng', isSystem: true, isAdminPanel: false, status: RoleStatus.ACTIVE },
    create: {
      code: 'CUSTOMER',
      name: 'Khách hàng',
      description: 'Tài khoản mua sắm trên Web Storefront',
      isSystem: true,
      isAdminPanel: false,
      status: RoleStatus.ACTIVE,
    },
  });

  // 3. Assign Permissions to Roles
  // Super Admin gets ALL permissions
  for (const [, permId] of permissionMap.entries()) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permId } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: permId },
    });
  }

  // Manager gets dashboard, users.read, products.*, orders.*
  const managerPermCodes = [
    'dashboard.view',
    'users.read',
    'roles.read',
    'products.read',
    'products.manage',
    'orders.read',
    'orders.manage',
  ];
  for (const code of managerPermCodes) {
    const permId = permissionMap.get(code);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: managerRole.id, permissionId: permId } },
        update: {},
        create: { roleId: managerRole.id, permissionId: permId },
      });
    }
  }

  // Staff gets dashboard.view, products.read, orders.read, orders.manage
  const staffPermCodes = ['dashboard.view', 'products.read', 'orders.read', 'orders.manage'];
  for (const code of staffPermCodes) {
    const permId = permissionMap.get(code);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: staffRole.id, permissionId: permId } },
        update: {},
        create: { roleId: staffRole.id, permissionId: permId },
      });
    }
  }

  // 4. Seed Default Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const customerPassword = await bcrypt.hash('Customer@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@bonzstore.com' },
    update: { roleId: superAdminRole.id, status: UserStatus.ACTIVE },
    create: {
      email: 'admin@bonzstore.com',
      passwordHash: adminPassword,
      fullName: 'BonzStore Super Admin',
      phone: '0901234567',
      status: UserStatus.ACTIVE,
      roleId: superAdminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@bonzstore.com' },
    update: { roleId: managerRole.id, status: UserStatus.ACTIVE },
    create: {
      email: 'manager@bonzstore.com',
      passwordHash: managerPassword,
      fullName: 'Nguyễn Quản Lý',
      phone: '0902345678',
      status: UserStatus.ACTIVE,
      roleId: managerRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@bonzstore.com' },
    update: { roleId: customerRole.id, status: UserStatus.ACTIVE },
    create: {
      email: 'customer@bonzstore.com',
      passwordHash: customerPassword,
      fullName: 'Trần Khách Hàng',
      phone: '0903456789',
      status: UserStatus.ACTIVE,
      roleId: customerRole.id,
    },
  });

  console.log('✅ Seeded RBAC Roles, Permissions & Default Users:');
  console.log('   - Super Admin: admin@bonzstore.com / Admin@123');
  console.log('   - Store Manager: manager@bonzstore.com / Manager@123');
  console.log('   - Customer: customer@bonzstore.com / Customer@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

