import { Languages } from 'lucide-react';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type Locale = 'vi' | 'en';
export const LANG_STORAGE_KEY = 'bonzstore_lang';

const TRANSLATIONS = {
  vi: {
    // Common & Header
    'app.brand': 'BonzStore Anime',
    'app.header.subtitle':
      'Hệ thống quản trị Anime Store (TikTok Black & #bddbd9)',
    'app.logout': 'Đăng xuất',
    'app.loading': 'Đang tải dữ liệu...',
    'app.checkingAuth': 'Đang kiểm tra phiên đăng nhập & phân quyền...',
    'app.empty': 'Không có dữ liệu phù hợp',
    'app.cancel': 'Hủy',
    'app.close': 'Đóng',
    'app.save': 'Lưu lại',
    'app.confirm': 'Xác nhận',
    'app.actions': 'Thao tác',
    'app.status': 'Trạng thái',
    'app.prev': 'Trước',
    'app.next': 'Sau',
    'app.paginationInfo':
      'Hiển thị {start}–{end} trên tổng số {total} bản ghi (Tối đa {limit} / trang)',
    'status.ACTIVE': 'Hoạt động',
    'status.INACTIVE': 'Đã ẩn',
    'status.LOCKED': 'Đã khóa',
    'status.MAINTENANCE': 'Bảo trì',
    'status.DRAFT': 'Bản nháp',
    'status.FREEZE': 'Đóng băng',

    // Navigation & Sidebar
    'nav.dashboard': 'Tổng quan',
    'nav.products': 'Sản phẩm Anime & Đồng bộ',
    'nav.categories': 'Danh mục (202405)',
    'nav.users': 'Tài khoản & Nhân sự',
    'nav.roles': 'Phân quyền RBAC',
    'nav.allowedPages': 'Trang được phép',
    'nav.totalPerms': 'Tổng quyền',
    'nav.expandSidebar': 'Mở rộng Sidebar',
    'nav.collapseSidebar': 'Thu gọn Sidebar',
    'nav.rbacActive': '3-Layer RBAC Active',

    // Login Page
    'login.subtitle': 'BonzStore Anime Admin',
    'login.title': 'Đăng nhập Quản trị viên',
    'login.email': 'Email Quản trị / Nhân viên',
    'login.password': 'Mật khẩu',
    'login.submit': 'Đăng nhập vào Dashboard',
    'login.submitting': 'Đang xác thực quyền Admin...',
    'login.demoTitle': 'Kiểm thử phân quyền 4 nhóm đối tượng (RBAC Seed):',
    'login.demoAdmin': '1. Super Admin',
    'login.demoManager': '2. Store Manager',
    'login.demoStaff': '3. Nhân viên (Staff)',
    'login.demoCustomer': '4. Khách hàng (Chặn 403)',

    // Dashboard Home
    'home.subtitle': 'Anime Figure & Manga Merch — Control Center',
    'home.welcome': 'Xin chào',
    'home.desc':
      'Hệ thống quản trị cửa hàng Anime với phân quyền RBAC 3 tầng & đồng bộ TikTok Shop',
    'home.configRbac': 'Cấu hình RBAC',
    'home.totalUsers': 'Tổng tài khoản',
    'home.activeUsers': 'Đang hoạt động',
    'home.adminStaff': 'Nhân sự Dashboard',
    'home.totalRoles': 'Vai trò (Roles)',
    'home.sessionTitle': 'Phiên đăng nhập & Quyền hạn hiện tại của bạn',
    'home.sessionSub':
      'Dữ liệu kiểm tra trực tiếp từ JWT Guard & endpoint GET /api/auth/me',
    'home.roleLabel': 'Vai trò (Role):',
    'home.portalLabel': 'Quyền truy cập Dashboard:',
    'home.portalAllowed': 'Được phép (isAdminPanel = true)',
    'home.portalRestricted': 'Hạn chế',
    'home.grantedPerms': 'Danh sách Permissions được cấp',

    // Users Page & Modals
    'users.subtitle':
      'Identity & Access Management (Admin, Nhân viên, Khách hàng)',
    'users.title': 'Quản lý Tài khoản & Đối tượng',
    'users.desc':
      'Quản lý tập trung Admin, Nhân viên và Khách hàng — Chỉ SUPER_ADMIN & STORE_MANAGER mới có quyền xem',
    'users.descSuperAdmin': 'Bạn đang có toàn quyền SUPER_ADMIN.',
    'users.descManager':
      'Chế độ {role}: Các tài khoản cấp cao hơn (SUPER_ADMIN) được mã hóa email và khóa chỉnh sửa.',
    'users.addBtn': 'Thêm Nhân viên / Quản lý',
    'users.tabAll': 'Tất cả đối tượng',
    'users.tabAdmin': 'Super Admin',
    'users.tabManager': 'Quản lý (Manager)',
    'users.tabStaff': 'Nhân viên (Staff)',
    'users.tabCustomer': 'Khách hàng (Customer)',
    'users.searchPlaceholder': 'Tìm theo tên, email hoặc vai trò...',
    'users.allStatus': 'Tất cả trạng thái',
    'users.colAccount': 'Tài khoản',
    'users.colRole': 'Vai trò (RBAC Role)',
    'users.colRoleTotal': 'Tổng các vai trò',
    'users.colPortal': 'Quyền Cổng (Portal Access)',
    'users.colStatusTotal': 'Tổng trạng thái',
    'users.portalYes': 'Vào được Dashboard',
    'users.portalNo': 'Chỉ Web Storefront',
    'users.colPerms': 'Quyền trang & thao tác',
    'users.systemRolesCount': '({count} vai trò hệ thống)',
    'users.summaryRolesTitle': 'Tổng các vai trò ({count} vai trò)',
    'users.summaryRolesSub': 'Phân bổ {total} tài khoản theo từng nhóm quyền',
    'users.summaryStatusTitle': 'Tổng trạng thái (3 trạng thái)',
    'users.summaryStatusSub':
      'Thống kê trạng thái hoạt động của toàn bộ tài khoản',
    'users.onlySuperAdmin': 'Chỉ SUPER_ADMIN',
    'users.onlySuperAdminDesc':
      'Quyền SUPER_ADMIN là duy nhất trong hệ thống — không thể tạo thêm hoặc gán cho tài khoản khác',
    'users.hashedBadge': 'Hashed',
    'users.hashedTooltip':
      'Email của tài khoản cấp cao hơn (SUPER_ADMIN) đã được mã hóa/hash bảo vệ',
    'users.protectedBadge': 'Protected',
    'users.viewDetailTooltip': 'Xem thông tin chi tiết',
    'users.editTooltip': 'Chỉnh sửa thông tin tài khoản',
    'users.resetPasswordTooltip': 'Reset mật khẩu tài khoản',
    'users.lockTooltip': 'Khóa tài khoản',
    'users.unlockTooltip': 'Mở khóa tài khoản',

    // User Modals (Create / View / Edit / Reset Password)
    'users.modalTitle': 'Tạo tài khoản mới',
    'users.editModalTitle': 'Chỉnh sửa tài khoản',
    'users.detailModalTitle': 'Hồ sơ chi tiết tài khoản',
    'users.resetModalTitle': 'Reset Password — Đặt lại mật khẩu',
    'users.fullName': 'Họ và tên',
    'users.phone': 'Số điện thoại',
    'users.phoneEmpty': 'Chưa cập nhật',
    'users.emailReadonly': 'Email (Không thể thay đổi)',
    'users.initPassword': 'Mật khẩu khởi tạo',
    'users.newPasswordLabel': 'Mật khẩu mới (Tối thiểu 6 ký tự)',
    'users.resetPasswordNotice':
      'Lưu ý: Đặt lại mật khẩu sẽ tự động thu hồi toàn bộ phiên đăng nhập cũ của tài khoản này.',
    'users.generateRandomPass': 'Tạo mật khẩu ngẫu nhiên',
    'users.copyPassword': 'Copy mật khẩu',
    'users.confirmReset': 'Xác nhận Reset',
    'users.editBtn': 'Chỉnh sửa',
    'users.resetBtn': 'Reset Password',
    'users.portalAndSessions': 'Quyền cổng & Phiên hoạt động',
    'users.activeSessionsCount': '{count} phiên',
    'users.createdAtLabel': 'Ngày tạo tài khoản',
    'users.lastLoginLabel': 'Đăng nhập gần nhất',
    'users.noDateData': 'Chưa có dữ liệu',
    'users.noAdminPerms':
      'Không có quyền quản trị (Tài khoản Khách hàng Storefront).',
    'users.validationNameEmail': 'Họ tên và Email không được để trống',
    'users.validationName': 'Họ và tên không được để trống',
    'users.validationPasswordLength': 'Mật khẩu mới phải có tối thiểu 6 ký tự',
    'users.validationRoleHierarchy':
      'Chỉ Super Admin (SUPER_ADMIN) mới có quyền gán vai trò này',

    // Roles Page
    'roles.subtitle': 'Role-Based Access Control (3-Layer RBAC)',
    'roles.title': 'Vai trò & Ma trận Phân quyền',
    'roles.desc':
      'Quản lý động các Role và gán quyền truy cập trang (Page Access) + quyền thao tác (Action Access)',
    'roles.addBtn': 'Tạo Vai trò mới',
    'roles.matrixTitle': 'Ma trận Quyền hạn',
    'roles.matrixDesc':
      'Bật/tắt các quyền bên dưới để cập nhật tức thì xuống PostgreSQL',
    'roles.accountsCount': 'tài khoản',
    'roles.permsCount': 'quyền',
    'roles.codeLabel': 'Mã Vai trò (Role Code)',
    'roles.nameLabel': 'Tên Vai trò (Role Name)',
    'roles.descLabel': 'Mô tả vai trò',
    'roles.isAdminPanelLabel':
      'isAdminPanel = true (Cho phép vào cổng Admin Dashboard)',

    // Categories Page
    'categories.subtitle':
      'TikTok Shop Partner API — get-authorized-category-assets-202405',
    'categories.title': 'Danh mục Ngành hàng Anime (Category Assets)',
    'categories.desc':
      'Cây danh mục Figure, Manga, Cosplay & Goods tương thích chuẩn TikTok Shop v202405',
    'categories.viewJson': 'Xem JSON 202405',
    'categories.hideJson': 'Ẩn JSON 202405',
    'categories.syncBtn': 'Đồng bộ từ TikTok Shop',
    'categories.syncing': 'Đang đồng bộ...',
    'categories.addBtn': 'Tạo Danh mục',
    'categories.localNameLabel': 'local_name (Tên Danh mục Anime)',
    'categories.externalIdLabel': 'externalCategoryId (TikTok / Shopee ID)',
    'categories.parentLabel': 'Danh mục Cha (Parent Category)',
    'categories.rootOption': '-- Danh mục gốc (parent_id = 0) --',
    'categories.isLeafLabel': 'is_leaf = true (Cho phép gắn sản phẩm SPU)',

    // Products Page
    'products.subtitle':
      'Anime Store Multi-Channel Sync (TikTok Shop & Shopee -> Web)',
    'products.title': 'Sản phẩm Anime & Đồng bộ Sàn',
    'products.desc':
      'Quản lý Figure, Nendoroid, Manga, Cosplay (SPU/SKU) và copy sản phẩm từ TikTok Shop / Shopee về Web',
    'products.copyTiktok': 'Copy SP từ TikTok Shop',
    'products.copyShopee': 'Copy SP từ Shopee',
    'products.addBtn': 'Thêm Sản phẩm Anime',
    'products.statTotal': 'Tổng Sản phẩm (SPU)',
    'products.statActive': 'Đang bán (ACTIVE)',
    'products.statSynced': 'Đồng bộ từ TikTok/Shopee',
    'products.statStock': 'Tổng Tồn kho SKU',
    'products.searchPlaceholder':
      'Tìm Figure, Manga, Cosplay hoặc mã Platform ID...',
    'products.allPlatforms': 'Tất cả nguồn (Platform)',
    'products.titleLabel': 'Tên sản phẩm Anime (SPU Title)',
    'products.leafCategoryLabel': 'Danh mục Lá (is_leaf = true)',
    'products.sellerSkuLabel': 'Mã SKU (Seller SKU)',
    'products.stockLabel': 'Số lượng tồn kho',
    'products.originalPriceLabel': 'Giá gốc (VND)',
    'products.salePriceLabel': 'Giá bán (VND)',

    // Forbidden
    'forbidden.title': '403 — Không đủ quyền truy cập trang',
    'forbidden.desc':
      'Tài khoản của bạn không có quyền hạn (Chỉ SUPER_ADMIN & STORE_MANAGER hoặc thiếu Permission) để truy cập tính năng này.',
    'forbidden.back': 'Quay lại Trang tổng quan',

    // API Call Toasts & Messages (i18n for all API operations)
    'api.loginSuccess': 'Chào mừng {name} ({role})',
    'api.loginError': 'Đăng nhập thất bại',
    'api.userCreateSuccess': 'Đã tạo tài khoản {email}',
    'api.userCreateError': 'Tạo tài khoản thất bại',
    'api.userUpdateSuccess': 'Đã cập nhật tài khoản {name}',
    'api.userUpdateError': 'Cập nhật tài khoản thất bại',
    'api.userResetPassSuccess':
      'Đã đặt lại mật khẩu và thu hồi phiên đăng nhập cũ',
    'api.userResetPassError': 'Đặt lại mật khẩu thất bại',
    'api.copiedPassword': 'Đã sao chép mật khẩu mới vào Clipboard',
    'api.roleCreateSuccess': 'Đã tạo vai trò {name} ({code})',
    'api.roleCreateError': 'Tạo vai trò thất bại',
    'api.roleUpdateSuccess': 'Đã cập nhật quyền hạn cho {name}',
    'api.roleUpdateError': 'Cập nhật quyền thất bại',
    'api.categoryCreateSuccess': 'Đã tạo danh mục {name}',
    'api.categoryCreateError': 'Tạo danh mục thất bại',
    'api.categorySyncSuccess': 'Đã đồng bộ {count} danh mục từ TikTok Shop',
    'api.categorySyncError': 'Đồng bộ danh mục thất bại',
    'api.productCreateSuccess': 'Đã thêm sản phẩm {title}',
    'api.productCreateError': 'Thêm sản phẩm thất bại',
    'api.productStatusSuccess': 'Đã chuyển trạng thái sang {status}',
    'api.productStatusError': 'Cập nhật trạng thái thất bại',
    'api.productImportSuccess': 'Đã đồng bộ sản phẩm từ sàn thành công',
    'api.productImportError': 'Đồng bộ sản phẩm thất bại',
    'api.networkError': 'Đã xảy ra lỗi kết nối máy chủ',
  },
  en: {
    // Common & Header
    'app.brand': 'BonzStore Anime',
    'app.header.subtitle':
      'Anime Store Admin System (TikTok Black & #bddbd9)',
    'app.logout': 'Logout',
    'app.loading': 'Loading data...',
    'app.checkingAuth': 'Verifying session & RBAC permissions...',
    'app.empty': 'No matching records found',
    'app.cancel': 'Cancel',
    'app.close': 'Close',
    'app.save': 'Save',
    'app.confirm': 'Confirm',
    'app.actions': 'Actions',
    'app.status': 'Status',
    'app.prev': 'Prev',
    'app.next': 'Next',
    'app.paginationInfo':
      'Showing {start}–{end} of {total} records (Max {limit} / page)',
    'status.ACTIVE': 'Active',
    'status.INACTIVE': 'Inactive',
    'status.LOCKED': 'Locked',
    'status.MAINTENANCE': 'Maintenance',
    'status.DRAFT': 'Draft',
    'status.FREEZE': 'Frozen',

    // Navigation & Sidebar
    'nav.dashboard': 'Overview',
    'nav.products': 'Anime Products & Sync',
    'nav.categories': 'Categories (202405)',
    'nav.users': 'Users & Staff',
    'nav.roles': 'RBAC Permissions',
    'nav.allowedPages': 'Allowed pages',
    'nav.totalPerms': 'Total permissions',
    'nav.expandSidebar': 'Expand Sidebar',
    'nav.collapseSidebar': 'Collapse Sidebar',
    'nav.rbacActive': '3-Layer RBAC Active',

    // Login Page
    'login.subtitle': 'BonzStore Anime Admin',
    'login.title': 'Administrator Sign In',
    'login.email': 'Admin / Staff Email',
    'login.password': 'Password',
    'login.submit': 'Sign In to Dashboard',
    'login.submitting': 'Verifying Admin Access...',
    'login.demoTitle': 'Quick Test — 4 Actor Groups (RBAC Seed):',
    'login.demoAdmin': '1. Super Admin',
    'login.demoManager': '2. Store Manager',
    'login.demoStaff': '3. Staff Member',
    'login.demoCustomer': '4. Customer (403 Blocked)',

    // Dashboard Home
    'home.subtitle': 'Anime Figure & Manga Merch — Control Center',
    'home.welcome': 'Welcome back',
    'home.desc':
      'Anime E-Commerce Admin with 3-Layer RBAC & TikTok Shop Synchronization',
    'home.configRbac': 'Configure RBAC',
    'home.totalUsers': 'Total Accounts',
    'home.activeUsers': 'Active Users',
    'home.adminStaff': 'Dashboard Staff',
    'home.totalRoles': 'Total Roles',
    'home.sessionTitle': 'Current Session & Active RBAC Permissions',
    'home.sessionSub': 'Verified directly via JWT Guard & GET /api/auth/me',
    'home.roleLabel': 'Assigned Role:',
    'home.portalLabel': 'Dashboard Portal Access:',
    'home.portalAllowed': 'Allowed (isAdminPanel = true)',
    'home.portalRestricted': 'Restricted',
    'home.grantedPerms': 'Granted Permission Codes',

    // Users Page & Modals
    'users.subtitle': 'Identity & Access Management (Admin, Staff, Customer)',
    'users.title': 'Accounts & Actors Management',
    'users.desc':
      'Manage Admins, Staff, and Customers — Only SUPER_ADMIN & STORE_MANAGER can view',
    'users.descSuperAdmin': 'You have full SUPER_ADMIN privileges.',
    'users.descManager':
      '{role} Mode: Higher-privilege accounts (SUPER_ADMIN) have hashed emails and are locked from editing.',
    'users.addBtn': 'Add Staff / Manager',
    'users.tabAll': 'All Actors',
    'users.tabAdmin': 'Super Admin',
    'users.tabManager': 'Store Manager',
    'users.tabStaff': 'Staff',
    'users.tabCustomer': 'Customer',
    'users.searchPlaceholder': 'Search by full name, email, or role...',
    'users.allStatus': 'All statuses',
    'users.colAccount': 'Account',
    'users.colRole': 'RBAC Role',
    'users.colRoleTotal': 'Total by Role',
    'users.colPortal': 'Portal Access',
    'users.colStatusTotal': 'Total by Status',
    'users.portalYes': 'Dashboard Allowed',
    'users.portalNo': 'Storefront Only',
    'users.colPerms': 'Page & Action Perms',
    'users.systemRolesCount': '({count} system roles)',
    'users.summaryRolesTitle': 'Total Roles ({count} roles)',
    'users.summaryRolesSub': 'Distribution of {total} accounts across roles',
    'users.summaryStatusTitle': 'Total Statuses (3 statuses)',
    'users.summaryStatusSub': 'Account status breakdown across the system',
    'users.onlySuperAdmin': 'SUPER_ADMIN Only',
    'users.onlySuperAdminDesc':
      'SUPER_ADMIN is unique in the system — cannot create or assign another SUPER_ADMIN',
    'users.hashedBadge': 'Hashed',
    'users.hashedTooltip':
      'Higher-privilege account (SUPER_ADMIN) email is hashed for security',
    'users.protectedBadge': 'Protected',
    'users.viewDetailTooltip': 'View account details',
    'users.editTooltip': 'Edit account profile',
    'users.resetPasswordTooltip': 'Reset account password',
    'users.lockTooltip': 'Lock account',
    'users.unlockTooltip': 'Unlock account',

    // User Modals (Create / View / Edit / Reset Password)
    'users.modalTitle': 'Create New Account',
    'users.editModalTitle': 'Edit Account',
    'users.detailModalTitle': 'Account Detailed Profile',
    'users.resetModalTitle': 'Reset Account Password',
    'users.fullName': 'Full Name',
    'users.phone': 'Phone Number',
    'users.phoneEmpty': 'Not provided',
    'users.emailReadonly': 'Email (Read-only)',
    'users.initPassword': 'Initial Password',
    'users.newPasswordLabel': 'New Password (Min 6 characters)',
    'users.resetPasswordNotice':
      'Note: Resetting the password will automatically revoke all active sessions for this user.',
    'users.generateRandomPass': 'Generate random password',
    'users.copyPassword': 'Copy password',
    'users.confirmReset': 'Confirm Reset',
    'users.editBtn': 'Edit Profile',
    'users.resetBtn': 'Reset Password',
    'users.portalAndSessions': 'Portal Access & Active Sessions',
    'users.activeSessionsCount': '{count} sessions',
    'users.createdAtLabel': 'Created At',
    'users.lastLoginLabel': 'Last Sign In',
    'users.noDateData': 'No data available',
    'users.noAdminPerms': 'No admin permissions (Storefront Customer account).',
    'users.validationNameEmail': 'Full Name and Email are required',
    'users.validationName': 'Full Name is required',
    'users.validationPasswordLength':
      'New password must be at least 6 characters',
    'users.validationRoleHierarchy':
      'Only Super Admin (SUPER_ADMIN) can assign this role',

    // Roles Page
    'roles.subtitle': 'Role-Based Access Control (3-Layer RBAC)',
    'roles.title': 'Roles & Permission Matrix',
    'roles.desc':
      'Dynamically manage Roles and assign Page Access + Action Access permissions',
    'roles.addBtn': 'Create New Role',
    'roles.matrixTitle': 'Permission Matrix',
    'roles.matrixDesc':
      'Toggle permissions below to update PostgreSQL in real time',
    'roles.accountsCount': 'accounts',
    'roles.permsCount': 'permissions',
    'roles.codeLabel': 'Role Code',
    'roles.nameLabel': 'Role Name',
    'roles.descLabel': 'Description',
    'roles.isAdminPanelLabel':
      'isAdminPanel = true (Allow access to Admin Dashboard)',

    // Categories Page
    'categories.subtitle':
      'TikTok Shop Partner API — get-authorized-category-assets-202405',
    'categories.title': 'Anime Category Assets (202405)',
    'categories.desc':
      'Multi-level Anime Figure, Manga, Cosplay & Merch category tree compatible with TikTok Shop v202405',
    'categories.viewJson': 'View 202405 JSON',
    'categories.hideJson': 'Hide 202405 JSON',
    'categories.syncBtn': 'Sync from TikTok Shop',
    'categories.syncing': 'Syncing...',
    'categories.addBtn': 'Create Category',
    'categories.localNameLabel': 'local_name (Anime Category Name)',
    'categories.externalIdLabel': 'externalCategoryId (TikTok / Shopee ID)',
    'categories.parentLabel': 'Parent Category',
    'categories.rootOption': '-- Root Category (parent_id = 0) --',
    'categories.isLeafLabel': 'is_leaf = true (Allow attaching SPU products)',

    // Products Page
    'products.subtitle':
      'Anime Store Multi-Channel Sync (TikTok Shop & Shopee -> Web)',
    'products.title': 'Anime Products & Platform Sync',
    'products.desc':
      'Manage Figures, Nendoroids, Manga, Cosplay (SPU/SKU) and copy products from TikTok Shop / Shopee',
    'products.copyTiktok': 'Copy from TikTok Shop',
    'products.copyShopee': 'Copy from Shopee',
    'products.addBtn': 'Add Anime Product',
    'products.statTotal': 'Total Products (SPU)',
    'products.statActive': 'Active (On Sale)',
    'products.statSynced': 'Synced (TikTok/Shopee)',
    'products.statStock': 'Total SKU Inventory',
    'products.searchPlaceholder':
      'Search Figure, Manga, Cosplay or Platform ID...',
    'products.allPlatforms': 'All Platforms',
    'products.titleLabel': 'Anime Product Title (SPU)',
    'products.leafCategoryLabel': 'Leaf Category (is_leaf = true)',
    'products.sellerSkuLabel': 'Seller SKU',
    'products.stockLabel': 'Stock Quantity',
    'products.originalPriceLabel': 'Original Price (VND)',
    'products.salePriceLabel': 'Sale Price (VND)',

    // Forbidden
    'forbidden.title': '403 — Access Denied',
    'forbidden.desc':
      'Your account does not have the required Role (SUPER_ADMIN / STORE_MANAGER) or Permission to access this resource.',
    'forbidden.back': 'Back to Overview',

    // API Call Toasts & Messages (i18n for all API operations)
    'api.loginSuccess': 'Welcome back, {name} ({role})',
    'api.loginError': 'Sign in failed',
    'api.userCreateSuccess': 'Created account {email}',
    'api.userCreateError': 'Failed to create account',
    'api.userUpdateSuccess': 'Updated account {name}',
    'api.userUpdateError': 'Failed to update account',
    'api.userResetPassSuccess':
      'Password reset and previous sessions revoked successfully',
    'api.userResetPassError': 'Failed to reset password',
    'api.copiedPassword': 'New password copied to clipboard',
    'api.roleCreateSuccess': 'Created role {name} ({code})',
    'api.roleCreateError': 'Failed to create role',
    'api.roleUpdateSuccess': 'Updated permissions for {name}',
    'api.roleUpdateError': 'Failed to update role permissions',
    'api.categoryCreateSuccess': 'Created category {name}',
    'api.categoryCreateError': 'Failed to create category',
    'api.categorySyncSuccess': 'Synced {count} categories from TikTok Shop',
    'api.categorySyncError': 'Failed to sync categories',
    'api.productCreateSuccess': 'Added product {title}',
    'api.productCreateError': 'Failed to add product',
    'api.productStatusSuccess': 'Changed product status to {status}',
    'api.productStatusError': 'Failed to update product status',
    'api.productImportSuccess': 'Imported product from platform successfully',
    'api.productImportError': 'Failed to import product from platform',
    'api.networkError': 'Server connection error occurred',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.vi;

export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return 'vi';
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  return saved === 'en' || saved === 'vi' ? saved : 'vi';
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    template,
  );
}

export function translateStatic(
  key: TranslationKey,
  params?: Record<string, string | number>,
  localeOverride?: Locale,
): string {
  const lang = localeOverride || getCurrentLocale();
  const raw = TRANSLATIONS[lang][key] || TRANSLATIONS.vi[key] || key;
  return interpolate(raw, params);
}

/**
 * Dịch tự động các thông báo lỗi/thành công trả về từ Backend sang ngôn ngữ hiện tại (VI / EN)
 */
const BACKEND_ERROR_MAP_EN: Array<{ match: RegExp; replace: string }> = [
  {
    match: /Email này đã tồn tại trong hệ thống/i,
    replace: 'This email already exists in the system',
  },
  {
    match: /Email không được để trống/i,
    replace: 'Email cannot be empty',
  },
  {
    match: /Vai trò không tồn tại|Vai trò không hợp lệ/i,
    replace: 'Invalid or non-existent role',
  },
  {
    match: /Không tìm thấy người dùng/i,
    replace: 'User not found',
  },
  {
    match: /Chỉ quyền SUPER_ADMIN và Quản lý cửa hàng \(STORE_MANAGER\) mới được phép xem/i,
    replace:
      'Only SUPER_ADMIN and STORE_MANAGER are allowed to view or access user data',
  },
  {
    match: /Vai trò SUPER_ADMIN là duy nhất trong hệ thống/i,
    replace:
      'SUPER_ADMIN role is unique in the system and cannot be created or assigned to another user',
  },
  {
    match: /Tài khoản SUPER_ADMIN là duy nhất trong hệ thống/i,
    replace:
      'The SUPER_ADMIN account is unique in the system and its role cannot be changed',
  },
  {
    match: /Chỉ Super Admin \(SUPER_ADMIN\) mới có quyền tạo tài khoản/i,
    replace:
      'Only Super Admin (SUPER_ADMIN) has permission to create or assign SUPER_ADMIN accounts',
  },
  {
    match: /không đủ thẩm quyền thao tác trên tài khoản cấp cao hơn/i,
    replace:
      'Insufficient privileges to modify or lock a higher-privilege account (SUPER_ADMIN)',
  },
  {
    match: /Không thể gán vai trò SUPER_ADMIN/i,
    replace: 'Cannot assign SUPER_ADMIN role. Only SUPER_ADMIN is allowed.',
  },
  {
    match: /không đủ thẩm quyền đặt lại mật khẩu cho tài khoản cấp cao hơn/i,
    replace:
      'Insufficient privileges to reset password for a higher-privilege account (SUPER_ADMIN)',
  },
  {
    match: /Mật khẩu mới phải có ít nhất 6 ký tự/i,
    replace: 'New password must be at least 6 characters',
  },
  {
    match: /Thông tin đăng nhập không chính xác/i,
    replace: 'Invalid email or password',
  },
  {
    match: /Tài khoản Khách hàng không được phép truy cập hệ thống Quản trị/i,
    replace: 'Customer accounts are not allowed to access the Admin Dashboard (403)',
  },
  {
    match: /Tài khoản của bạn đã bị khóa/i,
    replace: 'Your account has been locked',
  },
];

export function translateBackendMessage(message: string): string {
  const lang = getCurrentLocale();
  if (lang === 'vi' || !message) return message;
  for (const rule of BACKEND_ERROR_MAP_EN) {
    if (rule.match.test(message)) {
      return rule.replace;
    }
  }
  return message;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (lang: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getCurrentLocale());

  const setLocale = useCallback((lang: Locale) => {
    setLocaleState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === 'vi' ? 'en' : 'vi';
      localStorage.setItem(LANG_STORAGE_KEY, next);
      document.documentElement.lang = next;
      return next;
    });
  }, []);

  const t = useCallback(
    (
      key: TranslationKey,
      params?: Record<string, string | number>,
    ): string => {
      return translateStatic(key, params, locale);
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return ctx;
}

export function LanguageToggle() {
  const { locale, toggleLocale } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="action-btn-secondary px-2.5 py-1.5 font-display text-xs uppercase"
      title="Switch Language (VI / EN)"
    >
      <Languages className="h-3.5 w-3.5 text-foreground dark:text-primary" />
      <span>{locale === 'vi' ? 'VI' : 'EN'}</span>
    </button>
  );
}
