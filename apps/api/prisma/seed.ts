import {
  CategoryStatus,
  PrismaClient,
  ProductStatus,
  RoleStatus,
  SourcePlatform,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PERMISSIONS = [
  {
    code: 'dashboard.view',
    name: '[Trang] Xem Tổng quan Dashboard',
    module: 'DASHBOARD',
    description: 'Quyền truy cập trang Tổng quan Admin (/)',
  },
  {
    code: 'users.read',
    name: '[Trang] Xem danh sách Người dùng',
    module: 'USERS',
    description: 'Quyền truy cập trang /users và xem Admin, Nhân viên, Khách hàng',
  },
  {
    code: 'users.create',
    name: '[Thao tác] Tạo tài khoản mới',
    module: 'USERS',
    description: 'Thêm mới tài khoản Quản lý hoặc Nhân viên',
  },
  {
    code: 'users.update',
    name: '[Thao tác] Cập nhật & Khóa tài khoản',
    module: 'USERS',
    description: 'Đổi Role, chỉnh sửa thông tin, khóa/mở khóa tài khoản',
  },
  {
    code: 'users.delete',
    name: '[Thao tác] Xóa người dùng',
    module: 'USERS',
    description: 'Xóa vĩnh viễn tài khoản khỏi hệ thống',
  },
  {
    code: 'roles.read',
    name: '[Trang] Xem Vai trò & Phân quyền RBAC',
    module: 'ROLES',
    description: 'Quyền truy cập trang /roles và xem ma trận phân quyền',
  },
  {
    code: 'roles.manage',
    name: '[Thao tác] Quản lý Vai trò & Sửa Quyền',
    module: 'ROLES',
    description: 'Tạo Role mới và bật/tắt quyền truy cập trang / thao tác',
  },
  {
    code: 'products.read',
    name: '[Trang] Xem Danh mục & Sản phẩm',
    module: 'PRODUCTS',
    description: 'Quyền truy cập trang /categories và /products',
  },
  {
    code: 'products.manage',
    name: '[Thao tác] Thêm / Sửa / Xóa Sản phẩm',
    module: 'PRODUCTS',
    description: 'Tạo danh mục, tạo sản phẩm SPU/SKU, sửa giá và tồn kho',
  },
  {
    code: 'products.sync',
    name: '[Thao tác] Đồng bộ / Copy từ TikTok & Shopee',
    module: 'PRODUCTS',
    description: 'Đồng bộ Category Assets 202405 và copy sản phẩm từ sàn về Web',
  },
  {
    code: 'orders.read',
    name: '[Trang] Xem Đơn hàng',
    module: 'ORDERS',
    description: 'Xem danh sách đơn hàng của khách',
  },
  {
    code: 'orders.manage',
    name: '[Thao tác] Xử lý Đơn hàng',
    module: 'ORDERS',
    description: 'Cập nhật trạng thái và duyệt đơn hàng',
  },
];

async function main() {
  console.log('🌱 Starting RBAC, Actors & TikTok Shop Catalog seed...');

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

  // 2. Upsert Roles (Admin, Quản lý, Nhân viên, Khách hàng)
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
      description: 'Quản lý sản phẩm, đồng bộ sàn, đơn hàng và xem nhân sự',
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
      description: 'Nhân viên xem sản phẩm, kiểm tra tồn kho và xử lý đơn hàng',
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
      description: 'Khách mua hàng trên Web Storefront (Chặn vào Dashboard)',
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

  // Manager gets dashboard, users.read, roles.read, products.*, orders.*
  const managerPermCodes = [
    'dashboard.view',
    'users.read',
    'roles.read',
    'products.read',
    'products.manage',
    'products.sync',
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

  // 4. Seed Default Users (Admin, Manager, Staff, Customer)
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const staffPassword = await bcrypt.hash('Staff@123', 10);
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
    where: { email: 'staff@bonzstore.com' },
    update: { roleId: staffRole.id, status: UserStatus.ACTIVE },
    create: {
      email: 'staff@bonzstore.com',
      passwordHash: staffPassword,
      fullName: 'Lê Nhân Viên Vận Hành',
      phone: '0903456789',
      status: UserStatus.ACTIVE,
      roleId: staffRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@bonzstore.com' },
    update: { roleId: customerRole.id, status: UserStatus.ACTIVE },
    create: {
      email: 'customer@bonzstore.com',
      passwordHash: customerPassword,
      fullName: 'Trần Khách Hàng',
      phone: '0904567890',
      status: UserStatus.ACTIVE,
      roleId: customerRole.id,
    },
  });

  // 5. Seed TikTok Shop Anime Category Assets (202405 Standard)
  const rootFashion = await prisma.category.upsert({
    where: { externalCategoryId: '605001' },
    update: {},
    create: {
      externalCategoryId: '605001',
      externalParentId: '0',
      localName: 'Mô hình & Đồ chơi Anime (Figures & Collectibles)',
      slug: 'mo-hinh-do-choi-anime',
      level: 1,
      isLeaf: false,
      categoryVersion: 'v2',
      permissionStatuses: ['AVAILABLE'],
      status: CategoryStatus.ACTIVE,
    },
  });

  const leafTshirt = await prisma.category.upsert({
    where: { externalCategoryId: '605012' },
    update: { parentId: rootFashion.id },
    create: {
      externalCategoryId: '605012',
      parentId: rootFashion.id,
      externalParentId: '605001',
      localName: 'Scale Figure & Statue Chính hãng',
      slug: 'scale-figure-statue-chinh-hang',
      level: 2,
      isLeaf: true,
      categoryVersion: 'v2',
      permissionStatuses: ['AVAILABLE'],
      status: CategoryStatus.ACTIVE,
    },
  });

  const rootTech = await prisma.category.upsert({
    where: { externalCategoryId: '606001' },
    update: {},
    create: {
      externalCategoryId: '606001',
      externalParentId: '0',
      localName: 'Thời trang & Phụ kiện Cosplay Anime',
      slug: 'thoi-trang-phu-kien-cosplay-anime',
      level: 1,
      isLeaf: false,
      categoryVersion: 'v2',
      permissionStatuses: ['AVAILABLE'],
      status: CategoryStatus.ACTIVE,
    },
  });

  const leafAudio = await prisma.category.upsert({
    where: { externalCategoryId: '606025' },
    update: { parentId: rootTech.id },
    create: {
      externalCategoryId: '606025',
      parentId: rootTech.id,
      externalParentId: '606001',
      localName: 'Trang phục Cosplay & Áo Haori Kimetsu',
      slug: 'trang-phuc-cosplay-ao-haori-kimetsu',
      level: 2,
      isLeaf: true,
      categoryVersion: 'v2',
      permissionStatuses: ['AVAILABLE'],
      status: CategoryStatus.ACTIVE,
    },
  });

  // 6. Seed Sample Anime Products (SPU + SKUs)
  const existingProd1 = await prisma.product.findUnique({
    where: { slug: 'figure-luffy-gear-5-nika-tiktok-sync' },
  });
  if (!existingProd1) {
    await prisma.product.create({
      data: {
        title: 'Mô Hình Figure One Piece Luffy Gear 5 Sun God Nika (28cm)',
        slug: 'figure-luffy-gear-5-nika-tiktok-sync',
        descriptionHtml: '<p>Mô hình PVC cao cấp hiệu ứng mây tím & tia sét, đồng bộ trực tiếp từ TikTok Shop.</p>',
        categoryId: leafTshirt.id,
        brandName: 'Banpresto / Bandai',
        mainImages: [
          {
            url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
            width: 800,
            height: 800,
          },
        ],
        packageWeight: 0.85,
        packageDimensions: { length: 30, width: 24, height: 20, unit: 'CENTIMETER' },
        status: ProductStatus.ACTIVE,
        sourcePlatform: SourcePlatform.TIKTOK_SHOP,
        externalProductId: '17294839201928374',
        externalShopId: 'VN-ANIME-TTS-99',
        lastSyncedAt: new Date(),
        skus: {
          create: [
            {
              externalSkuId: '17294839201928375',
              sellerSku: 'FIG-LUFFY-G5-STD',
              salesAttributes: [
                { name: 'Phiên bản', value_name: 'Standard Box' },
                { name: 'Chiều cao', value_name: '28cm' },
              ],
              originalPrice: 1290000,
              salePrice: 890000,
              stockQuantity: 60,
            },
            {
              externalSkuId: '17294839201928376',
              sellerSku: 'FIG-LUFFY-G5-LED',
              salesAttributes: [
                { name: 'Phiên bản', value_name: 'Deluxe LED Lightning' },
                { name: 'Chiều cao', value_name: '32cm' },
              ],
              originalPrice: 1650000,
              salePrice: 1190000,
              stockQuantity: 25,
            },
          ],
        },
      },
    });
  }

  const existingProd2 = await prisma.product.findUnique({
    where: { slug: 'tai-nghe-bluetooth-anc-pro-shopee' },
  });
  if (!existingProd2) {
    await prisma.product.create({
      data: {
        title: 'Tai Nghe Bluetooth Chống Ồn Chủ Động ANC Pro 5.3',
        slug: 'tai-nghe-bluetooth-anc-pro-shopee',
        descriptionHtml: '<p>Pin 40 giờ, chống ồn ANC -42dB, đồng bộ từ Shopee Mall.</p>',
        categoryId: leafAudio.id,
        brandName: 'BonzAudio',
        mainImages: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
            width: 800,
            height: 800,
          },
        ],
        packageWeight: 0.4,
        packageDimensions: { length: 15, width: 12, height: 8, unit: 'CENTIMETER' },
        status: ProductStatus.ACTIVE,
        sourcePlatform: SourcePlatform.SHOPEE,
        externalProductId: 'SP-2491029384',
        externalShopId: 'SHOPEE-VN-1122',
        lastSyncedAt: new Date(),
        skus: {
          create: [
            {
              externalSkuId: 'SP-SKU-01',
              sellerSku: 'ANC-PRO-WHT',
              salesAttributes: [{ name: 'Màu sắc', value_name: 'Trắng Ceramic' }],
              originalPrice: 890000,
              salePrice: 549000,
              stockQuantity: 45,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Seeded RBAC, 4 Actors & TikTok Shop 202405 Catalog successfully:');
  console.log('   - Super Admin: admin@bonzstore.com / Admin@123');
  console.log('   - Store Manager: manager@bonzstore.com / Manager@123');
  console.log('   - Staff: staff@bonzstore.com / Staff@123');
  console.log('   - Customer (Blocked on Dashboard): customer@bonzstore.com / Customer@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
