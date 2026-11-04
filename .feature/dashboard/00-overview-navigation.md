# Tổng Quan Kiến Trúc & Điều Hướng — Admin Dashboard (`apps/dashboard`)

> **Thư mục code**: `apps/dashboard` (Vite + React + TailwindCSS + TanStack React Query + Tailwind Admin UI)
> **Cổng chạy mặc định**: `http://localhost:5173`
> **Hằng số RBAC tập trung**: [`rbac.constants.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/constants/rbac.constants.ts) (`ROLES`, `PERMISSIONS`, `ADMIN_MANAGER_ROLES`, `ROLE_RANK`)
> **Đối tượng được phép truy cập**: Chỉ **Super Admin** (`SUPER_ADMIN`), **Quản lý** (`STORE_MANAGER`) và **Nhân viên** (`STAFF` có `isAdminPanel = true`). **Khách hàng** (`CUSTOMER`) bị chặn hoàn toàn.

---

## 1. Cấu Trúc Layout, Header & Điều Hướng

Giao diện Dashboard sử dụng bộ CSS Component chuẩn trong [`apps/dashboard/src/index.css`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/index.css) và chia thành các thành phần chính:

- **[`MainLayout.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/MainLayout.tsx)**: Khung bố cục chính cho toàn bộ các trang sau khi đăng nhập.
- **[`AppSidebar.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/AppSidebar.tsx)** (Desktop, hỗ trợ thu gọn/mở rộng và nhóm menu con) & **[`BottomNav.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/BottomNav.tsx)** (Mobile):
  - Tự động đọc danh sách `user.permissions` và `user.role` từ `AuthContext`.
  - **Chỉ hiển thị menu của những trang (Page)** mà tài khoản hiện tại được cấp quyền truy cập.
- **[`AppHeader.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/AppHeader.tsx)**:
  - Hiển thị Badge vai trò hiện tại (`SUPER_ADMIN`, `STORE_MANAGER`, `STAFF`), họ tên, email và nút **Đăng xuất**.
  - Tích hợp **Chuông Thông Báo Admin ([`NotificationBell.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/notifications/components/NotificationBell.tsx))** hiển thị số lượng thông báo chưa đọc thời gian thực, lọc nhanh theo tác vụ **Thêm mới (`CREATE`) / Chỉnh sửa (`UPDATE`) / Xóa (`DELETE`)** và dẫn tới trang **Cài đặt thông báo (`/settings/notifications`)**.
  - Tích hợp nút chuyển đổi ngôn ngữ **Song ngữ `VI / EN` (`LanguageToggle`)** và giao diện **Sáng / Tối (`ThemeToggle`)**.
- **Chuẩn Phân Trang Dùng Chung ([`Pagination.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/ui/pagination.tsx))**:
  - Đồng bộ trên toàn bộ các trang danh sách (`/products`, `/categories`, `/tags`, `/imports`, `/cashbook`, `/users`, `/settings/notifications`) theo chuẩn TikTok Shop Seller Center:
  - Bên trái hiển thị `Tổng số hàng: {total}` (`Total rows: {total}`).
  - Bên phải hiển thị cụm nút chuyển trang `< 1 2 ... >` kèm bộ chọn số dòng mỗi trang `10/Trang`, `20/Trang`, `50/Trang` đồng bộ trực tiếp với URL query params (`?page=...&limit=...`).

---

## 2. Sơ Đồ Các Trang (Pages Map) & Quyền Truy Cập Trang (Page Access)

| STT | Đường dẫn (Route) | Tên Trang (Page Component) | Quyền Truy Cập Trang (`requiredPermission` / `requiredRoles`) | Ai được vào mặc định? | Tài liệu chi tiết |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `/login` | [`LoginPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/LoginPage.tsx) | Public (Kiểm tra `isAdminPanel` khi submit) | Admin, Quản lý, Nhân viên | [01-login-page.md](./01-login-page.md) |
| 2 | `/` | [`DashboardHomePage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/DashboardHomePage.tsx) | `PERMISSIONS.DASHBOARD_VIEW` | Admin, Quản lý, Nhân viên | [02-dashboard-home-page.md](./02-dashboard-home-page.md) |
| 3 | `/products` | [`ProductsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ProductsPage.tsx) | `PERMISSIONS.PRODUCTS_READ` | Admin, Quản lý, Nhân viên | [05-products-categories-page.md](./05-products-categories-page.md) |
| 4 | `/products/create` | [`CreateProductPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/CreateProductPage.tsx) | `PERMISSIONS.PRODUCTS_MANAGE` | Admin, Quản lý, Nhân viên SP | [05-products-categories-page.md](./05-products-categories-page.md) |
| 5 | `/categories` | [`CategoriesPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/CategoriesPage.tsx) | `PERMISSIONS.PRODUCTS_READ` *(Thêm/Sửa/Xóa: `ADMIN_MANAGER_ROLES`)* | Admin, Quản lý, Nhân viên | [05-products-categories-page.md](./05-products-categories-page.md) |
| 6 | `/tags` | [`TagsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/TagsPage.tsx) | `PERMISSIONS.PRODUCTS_READ` *(Thêm/Sửa/Xóa: `ADMIN_MANAGER_ROLES`)* | Admin, Quản lý, Nhân viên | [05-products-categories-page.md](./05-products-categories-page.md) |
| 7 | `/imports` | [`ImportsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ImportsPage.tsx) | `PERMISSIONS.DASHBOARD_VIEW` *(Đồng bộ & Restore: `ADMIN_MANAGER_ROLES`)* | Admin, Quản lý, Nhân viên | [07-imports-cashbook-charts-page.md](./07-imports-cashbook-charts-page.md) |
| 8 | `/cashbook` | [`CashbookPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/CashbookPage.tsx) | `PERMISSIONS.DASHBOARD_VIEW` *(Lập phiếu Thu/Chi: `ADMIN_MANAGER_ROLES`)* | Admin, Quản lý, Nhân viên | [07-imports-cashbook-charts-page.md](./07-imports-cashbook-charts-page.md) |
| 9 | `/charts` | [`ChartsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ChartsPage.tsx) | `PERMISSIONS.DASHBOARD_VIEW` | Admin, Quản lý, Nhân viên | [07-imports-cashbook-charts-page.md](./07-imports-cashbook-charts-page.md) |
| 10 | `/users` | [`UsersPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/UsersPage.tsx) | `PERMISSIONS.USERS_READ` + `ADMIN_MANAGER_ROLES` | Super Admin, Quản lý | [03-users-management-page.md](./03-users-management-page.md) |
| 11 | `/roles` | [`RolesPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/RolesPage.tsx) | `PERMISSIONS.ROLES_READ` | Super Admin, Quản lý | [04-roles-permissions-page.md](./04-roles-permissions-page.md) |
| 12 | `/settings/notifications` | [`NotificationSettingsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/NotificationSettingsPage.tsx) | `PERMISSIONS.DASHBOARD_VIEW` *(Cấu hình: `ADMIN_MANAGER_ROLES`)* | Admin, Quản lý, Nhân viên | [06-notifications-settings-page.md](./06-notifications-settings-page.md) |
| 13 | `/forbidden` | [`ForbiddenPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ForbiddenPage.tsx) | Đã đăng nhập | Hiển thị khi thiếu quyền vào trang | — |
