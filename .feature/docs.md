# Tài Liệu Tổng Quan & Mục Lục Tính Năng — BonzStore (`.feature`)

> **Định hướng hiện tại**: Phát triển hoàn chỉnh **Admin Dashboard (`apps/dashboard`)** và **Backend API (`apps/api`)** theo chuẩn TikTok Shop / Shopee Open Platform.
> - Phân tách rõ 4 vai trò tập trung trong hằng số [`ROLES` & `PERMISSIONS`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/common/constants/rbac.constants.ts) (Backend) và [`rbac.constants.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/constants/rbac.constants.ts) (Frontend): **Super Admin (`SUPER_ADMIN`)**, **Quản lý (`STORE_MANAGER`)**, **Nhân viên (`STAFF`)**, **Khách hàng (`CUSTOMER`)**.
> - Chỉ **Admin**, **Quản lý** và **Nhân viên** (`isAdminPanel = true`) mới được quyền truy cập vào Dashboard.
> - Phân quyền đa tầng: Kiểm tra **Quyền truy cập trang (Page Access)** trên Sidebar/Router và **Quyền thao tác (Action Access)** trên từng nút bấm & API.
> - Đồng bộ chuẩn **Pagination** (`Tổng số hàng: N | < 1 > | 10/Trang`, `20/Trang`, `50/Trang`), tìm kiếm có **Debounce (`400ms`)**, sắp xếp cột (`Sort`) và đa ngôn ngữ **Song ngữ `VI / EN`** trên toàn hệ thống.

---

## 1. Tài Liệu Các Trang Trên Admin Dashboard (`.feature/dashboard/`)

| STT | Trang / Tính năng trên Dashboard | Route | Quyền Truy Cập Trang | File Tài Liệu Chi Tiết |
| :-: | :--- | :--- | :--- | :--- |
| 0 | **Tổng quan Layout, Sidebar, Chuông Thông báo & Cơ chế Bảo vệ Trang/Nút bấm** | Toàn cục | `isAdminPanel = true` | [`.feature/dashboard/00-overview-navigation.md`](./dashboard/00-overview-navigation.md) |
| 1 | **Trang Đăng nhập Quản trị (`LoginPage`)** — Chặn Khách hàng (403) | `/login` | Public (Kiểm tra quyền Admin khi login) | [`.feature/dashboard/01-login-page.md`](./dashboard/01-login-page.md) |
| 2 | **Trang Tổng quan (`DashboardHomePage`)** — Thống kê & Hồ sơ RBAC | `/` | `dashboard.view` | [`.feature/dashboard/02-dashboard-home-page.md`](./dashboard/02-dashboard-home-page.md) |
| 3 | **Trang Quản lý Người dùng (`UsersPage`)** — Admin, Quản lý, Nhân viên, Khách hàng | `/users` | `users.read` + `ADMIN_MANAGER_ROLES` *(Thao tác: `users.create`, `users.update`)* | [`.feature/dashboard/03-users-management-page.md`](./dashboard/03-users-management-page.md) |
| 4 | **Trang Phân quyền RBAC (`RolesPage`)** — Vai trò & Ma trận Quyền hạn | `/roles` | `roles.read` *(Thao tác: `roles.manage`)* | [`.feature/dashboard/04-roles-permissions-page.md`](./dashboard/04-roles-permissions-page.md) |
| 5 | **Phân hệ Sản phẩm, Danh mục (`202405`) & Thẻ (`Products` / `Categories` / `Tags`)** | `/products`, `/products/create`, `/categories`, `/tags` | `products.read` *(Thao tác: `products.manage` + `ADMIN_MANAGER_ROLES`)* | [`.feature/dashboard/05-products-categories-page.md`](./dashboard/05-products-categories-page.md) |
| 6 | **Chuông Thông báo Admin & Trang Cài đặt Thông báo (Thêm / Sửa / Xóa)** | `/settings/notifications` + Header Bell | `dashboard.view` *(Cấu hình & Xóa: `ADMIN_MANAGER_ROLES`)* | [`.feature/dashboard/06-notifications-settings-page.md`](./dashboard/06-notifications-settings-page.md) |

---

## 2. Tài Liệu Các Module Backend API Tương Ứng (`.feature/api/`)

| STT | Module API (`apps/api`) | Base Endpoint | File Tài Liệu Chi Tiết |
| :-: | :--- | :--- | :--- |
| 0 | **Chuẩn JSON Response & Hệ thống 3 Guards (`Jwt`, `Roles`, `Permissions`)** | `/api/*` | [`.feature/api/00-api-standard-and-guards.md`](./api/00-api-standard-and-guards.md) |
| 1 | **API Xác thực & Đăng nhập Admin / Storefront** | `/api/auth/*` | [`.feature/api/01-auth-api.md`](./api/01-auth-api.md) |
| 2 | **API Quản lý Tài khoản (Admin, Quản lý, Nhân viên, Khách hàng)** | `/api/users/*` | [`.feature/api/02-users-api.md`](./api/02-users-api.md) |
| 3 | **API Quản lý Vai trò & Ma trận Phân quyền (RBAC)** | `/api/roles/*` | [`.feature/api/03-roles-permissions-api.md`](./api/03-roles-permissions-api.md) |
| 4 | **API Danh mục, Sản phẩm & Thẻ chuẩn TikTok Shop `202405`** | `/api/categories/*`, `/api/products/*` | [`.feature/api/04-catalog-tiktokshop-api.md`](./api/04-catalog-tiktokshop-api.md) |
| 5 | **API Thông báo Admin & Cấu hình Sự kiện Thêm / Sửa / Xóa (`CRUD`)** | `/api/notifications/*` | [`.feature/api/05-notifications-api.md`](./api/05-notifications-api.md) |

---

## 3. Tóm Tắt Ma Trận Phân Quyền (Portal → Page → Action)

| Đối tượng (`ROLES`) | Đăng nhập Dashboard (`/login`) | Tổng quan (`/`) & Chuông Thông báo | Sản phẩm, Danh mục, Thẻ (`/products`, `/categories`, `/tags`) | Người dùng (`/users`) | Phân quyền (`/roles`) | Cài đặt Thông báo (`/settings/notifications`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Admin (`SUPER_ADMIN`)** | ✅ Cho phép | ✅ Toàn quyền | ✅ Xem + Thêm / Sửa / Xóa | ✅ Toàn quyền (Xem rõ mọi email) | ✅ Xem + Sửa Ma trận Quyền | ✅ Xem + Bật/Tắt cấu hình Thêm/Sửa/Xóa |
| **Quản lý (`STORE_MANAGER`)** | ✅ Cho phép | ✅ Toàn quyền | ✅ Xem + Thêm / Sửa / Xóa | ✅ Xem (Hash email `SUPER_ADMIN`) + Sửa cấp dưới | ✅ Chỉ xem | ✅ Xem + Bật/Tắt cấu hình Thêm/Sửa/Xóa |
| **Nhân viên (`STAFF`)** | ✅ Cho phép | ✅ Cho phép | ✅ Xem (Khóa nút Thêm/Sửa/Xóa Danh mục & Thẻ) | ❌ Ẩn menu & Chặn URL (403) | ❌ Ẩn menu & Chặn URL (403) | 👀 Xem thông báo (Khóa công tắc cài đặt) |
| **Khách hàng (`CUSTOMER`)** | ❌ **Chặn ngay từ cổng Login (403)** | ❌ Chặn | ❌ Chặn | ❌ Chặn | ❌ Chặn | ❌ Chặn |
