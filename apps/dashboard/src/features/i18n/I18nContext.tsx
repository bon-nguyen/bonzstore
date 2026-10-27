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

const TRANSLATIONS = {
  vi: {
    // Common & Header
    'app.brand': 'BonzStore Anime',
    'app.header.subtitle': 'Hệ thống quản trị Anime Store (TikTok Black & #bddbd9)',
    'app.logout': 'Đăng xuất',
    'app.loading': 'Đang tải dữ liệu...',
    'app.empty': 'Không có dữ liệu phù hợp',
    'app.cancel': 'Hủy',
    'app.save': 'Lưu lại',
    'app.actions': 'Thao tác',
    'app.status': 'Trạng thái',
    'status.ACTIVE': 'Hoạt động',
    'status.INACTIVE': 'Đã ẩn',
    'status.LOCKED': 'Đã khóa',
    'status.MAINTENANCE': 'Bảo trì',
    'status.DRAFT': 'Bản nháp',
    'status.FREEZE': 'Đóng băng',

    // Navigation
    'nav.dashboard': 'Tổng quan',
    'nav.products': 'Sản phẩm Anime & Đồng bộ',
    'nav.categories': 'Danh mục (202405)',
    'nav.users': 'Tài khoản & Nhân sự',
    'nav.roles': 'Phân quyền RBAC',
    'nav.allowedPages': 'Trang được phép',
    'nav.totalPerms': 'Tổng quyền',

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
    'home.desc': 'Hệ thống quản trị cửa hàng Anime với phân quyền RBAC 3 tầng & đồng bộ TikTok Shop',
    'home.configRbac': 'Cấu hình RBAC',
    'home.totalUsers': 'Tổng tài khoản',
    'home.activeUsers': 'Đang hoạt động',
    'home.adminStaff': 'Nhân sự Dashboard',
    'home.totalRoles': 'Vai trò (Roles)',
    'home.sessionTitle': 'Phiên đăng nhập & Quyền hạn hiện tại của bạn',
    'home.sessionSub': 'Dữ liệu kiểm tra trực tiếp từ JWT Guard & endpoint GET /api/auth/me',
    'home.roleLabel': 'Vai trò (Role):',
    'home.portalLabel': 'Quyền truy cập Dashboard:',
    'home.portalAllowed': 'Được phép (isAdminPanel = true)',
    'home.portalRestricted': 'Hạn chế',
    'home.grantedPerms': 'Danh sách Permissions được cấp',

    // Users Page
    'users.subtitle': 'Identity & Access Management (Admin, Nhân viên, Khách hàng)',
    'users.title': 'Quản lý Tài khoản & Đối tượng',
    'users.desc': 'Quản lý tập trung Admin, Nhân viên và Khách hàng — Chỉ Admin & Nhân viên mới vào được Dashboard',
    'users.addBtn': 'Thêm Nhân viên / Quản lý',
    'users.tabAll': 'Tất cả đối tượng',
    'users.tabAdmin': 'Super Admin',
    'users.tabManager': 'Quản lý (Manager)',
    'users.tabStaff': 'Nhân viên (Staff)',
    'users.tabCustomer': 'Khách hàng (Customer)',
    'users.searchPlaceholder': 'Tìm theo tên hoặc email...',
    'users.allStatus': 'Tất cả trạng thái',
    'users.colAccount': 'Tài khoản',
    'users.colRole': 'Vai trò (RBAC Role)',
    'users.colPortal': 'Quyền Cổng (Portal Access)',
    'users.portalYes': 'Vào được Dashboard',
    'users.portalNo': 'Chỉ Web Storefront',
    'users.colPerms': 'Quyền trang & thao tác',
    'users.modalTitle': 'Tạo tài khoản mới',
    'users.fullName': 'Họ và tên',
    'users.initPassword': 'Mật khẩu khởi tạo',

    // Roles Page
    'roles.subtitle': 'Role-Based Access Control (3-Layer RBAC)',
    'roles.title': 'Vai trò & Ma trận Phân quyền',
    'roles.desc': 'Quản lý động các Role và gán quyền truy cập trang (Page Access) + quyền thao tác (Action Access)',
    'roles.addBtn': 'Tạo Vai trò mới',
    'roles.matrixTitle': 'Ma trận Quyền hạn',
    'roles.matrixDesc': 'Bật/tắt các quyền bên dưới để cập nhật tức thì xuống PostgreSQL',
    'roles.accountsCount': 'tài khoản',
    'roles.permsCount': 'quyền',

    // Categories Page
    'categories.subtitle': 'TikTok Shop Partner API — get-authorized-category-assets-202405',
    'categories.title': 'Danh mục Ngành hàng Anime (Category Assets)',
    'categories.desc': 'Cây danh mục Figure, Manga, Cosplay & Goods tương thích chuẩn TikTok Shop v202405',
    'categories.viewJson': 'Xem JSON 202405',
    'categories.hideJson': 'Ẩn JSON 202405',
    'categories.syncBtn': 'Đồng bộ từ TikTok Shop',
    'categories.syncing': 'Đang đồng bộ...',
    'categories.addBtn': 'Tạo Danh mục',

    // Products Page
    'products.subtitle': 'Anime Store Multi-Channel Sync (TikTok Shop & Shopee -> Web)',
    'products.title': 'Sản phẩm Anime & Đồng bộ Sàn',
    'products.desc': 'Quản lý Figure, Nendoroid, Manga, Cosplay (SPU/SKU) và copy sản phẩm từ TikTok Shop / Shopee về Web',
    'products.copyTiktok': 'Copy SP từ TikTok Shop',
    'products.copyShopee': 'Copy SP từ Shopee',
    'products.addBtn': 'Thêm Sản phẩm Anime',
    'products.statTotal': 'Tổng Sản phẩm (SPU)',
    'products.statActive': 'Đang bán (ACTIVE)',
    'products.statSynced': 'Đồng bộ từ TikTok/Shopee',
    'products.statStock': 'Tổng Tồn kho SKU',
    'products.searchPlaceholder': 'Tìm Figure, Manga, Cosplay hoặc mã Platform ID...',
    'products.allPlatforms': 'Tất cả nguồn (Platform)',

    // Forbidden
    'forbidden.title': '403 — Không đủ quyền truy cập trang',
    'forbidden.desc': 'Tài khoản của bạn không có quyền hạn (Page / Action Permission) để truy cập tính năng này.',
    'forbidden.back': 'Quay lại Trang tổng quan',
  },
  en: {
    // Common & Header
    'app.brand': 'BonzStore Anime',
    'app.header.subtitle': 'Anime Store Admin System (TikTok Black & #bddbd9)',
    'app.logout': 'Logout',
    'app.loading': 'Loading data...',
    'app.empty': 'No matching records found',
    'app.cancel': 'Cancel',
    'app.save': 'Save',
    'app.actions': 'Actions',
    'app.status': 'Status',
    'status.ACTIVE': 'Active',
    'status.INACTIVE': 'Inactive',
    'status.LOCKED': 'Locked',
    'status.MAINTENANCE': 'Maintenance',
    'status.DRAFT': 'Draft',
    'status.FREEZE': 'Frozen',

    // Navigation
    'nav.dashboard': 'Overview',
    'nav.products': 'Anime Products & Sync',
    'nav.categories': 'Categories (202405)',
    'nav.users': 'Users & Staff',
    'nav.roles': 'RBAC Permissions',
    'nav.allowedPages': 'Allowed pages',
    'nav.totalPerms': 'Total permissions',

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
    'home.desc': 'Anime E-Commerce Admin with 3-Layer RBAC & TikTok Shop Synchronization',
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

    // Users Page
    'users.subtitle': 'Identity & Access Management (Admin, Staff, Customer)',
    'users.title': 'Accounts & Actors Management',
    'users.desc': 'Manage Admins, Staff, and Customers — Only Admin & Staff can enter the Dashboard',
    'users.addBtn': 'Add Staff / Manager',
    'users.tabAll': 'All Actors',
    'users.tabAdmin': 'Super Admin',
    'users.tabManager': 'Store Manager',
    'users.tabStaff': 'Staff',
    'users.tabCustomer': 'Customer',
    'users.searchPlaceholder': 'Search by full name or email...',
    'users.allStatus': 'All statuses',
    'users.colAccount': 'Account',
    'users.colRole': 'RBAC Role',
    'users.colPortal': 'Portal Access',
    'users.portalYes': 'Dashboard Allowed',
    'users.portalNo': 'Storefront Only',
    'users.colPerms': 'Page & Action Perms',
    'users.modalTitle': 'Create New Account',
    'users.fullName': 'Full Name',
    'users.initPassword': 'Initial Password',

    // Roles Page
    'roles.subtitle': 'Role-Based Access Control (3-Layer RBAC)',
    'roles.title': 'Roles & Permission Matrix',
    'roles.desc': 'Dynamically manage Roles and assign Page Access + Action Access permissions',
    'roles.addBtn': 'Create New Role',
    'roles.matrixTitle': 'Permission Matrix',
    'roles.matrixDesc': 'Toggle permissions below to update PostgreSQL in real time',
    'roles.accountsCount': 'accounts',
    'roles.permsCount': 'permissions',

    // Categories Page
    'categories.subtitle': 'TikTok Shop Partner API — get-authorized-category-assets-202405',
    'categories.title': 'Anime Category Assets (202405)',
    'categories.desc': 'Multi-level Anime Figure, Manga, Cosplay & Merch category tree compatible with TikTok Shop v202405',
    'categories.viewJson': 'View 202405 JSON',
    'categories.hideJson': 'Hide 202405 JSON',
    'categories.syncBtn': 'Sync from TikTok Shop',
    'categories.syncing': 'Syncing...',
    'categories.addBtn': 'Create Category',

    // Products Page
    'products.subtitle': 'Anime Store Multi-Channel Sync (TikTok Shop & Shopee -> Web)',
    'products.title': 'Anime Products & Platform Sync',
    'products.desc': 'Manage Figures, Nendoroids, Manga, Cosplay (SPU/SKU) and copy products from TikTok Shop / Shopee',
    'products.copyTiktok': 'Copy from TikTok Shop',
    'products.copyShopee': 'Copy from Shopee',
    'products.addBtn': 'Add Anime Product',
    'products.statTotal': 'Total Products (SPU)',
    'products.statActive': 'Active (On Sale)',
    'products.statSynced': 'Synced (TikTok/Shopee)',
    'products.statStock': 'Total SKU Inventory',
    'products.searchPlaceholder': 'Search Figure, Manga, Cosplay or Platform ID...',
    'products.allPlatforms': 'All Platforms',

    // Forbidden
    'forbidden.title': '403 — Access Denied',
    'forbidden.desc': 'Your account does not have the required Page or Action Permission to access this resource.',
    'forbidden.back': 'Back to Overview',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.vi;

interface I18nContextValue {
  locale: Locale;
  setLocale: (lang: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
}

const LANG_STORAGE_KEY = 'bonzstore_lang';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Locale | null;
    return saved === 'en' || saved === 'vi' ? saved : 'vi';
  });

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
    (key: TranslationKey): string => {
      return TRANSLATIONS[locale][key] || TRANSLATIONS.vi[key] || key;
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

