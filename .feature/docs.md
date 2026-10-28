# Tài Liệu Tổng Quan & Mục Lục Tính Năng — BonzStore (`.feature`)

> **Định hướng hiện tại**: Ưu tiên phát triển hoàn chỉnh **Admin Dashboard (`apps/dashboard`)** và **Backend API (`apps/api`)** theo chuẩn TikTok Shop / Shopee Open Platform.
> - Phân tách rõ 3 đối tượng: **Admin**, **Nhân viên**, **Khách hàng**.
> - Chỉ **Admin** và **Nhân viên** (`isAdminPanel = true`) mới được quyền truy cập vào Dashboard.
> - Phân quyền đa tầng: Kiểm tra **Quyền truy cập trang (Page Access)** trên Sidebar/Router và **Quyền thao tác (Action Access)** trên từng nút bấm & API.
> - Sẵn sàng cấu trúc bảng Danh mục & Sản phẩm tham khảo [TikTok Shop Category Assets 202405](https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405) để phát triển tính năng liên kết đồng bộ, copy sản phẩm từ sàn về Web ở giai đoạn tiếp theo.

---

## 1. Tài Liệu Các Trang Trên Admin Dashboard (`.feature/dashboard/`)

| STT | Trang / Tính năng trên Dashboard | Route | Quyền Truy Cập Trang | File Tài Liệu Chi Tiết |
| :-: | :--- | :--- | :--- | :--- |
| 0 | **Tổng quan Layout, Sidebar & Cơ chế Bảo vệ Trang/Nút bấm** | Toàn cục | `isAdminPanel = true` | [`.feature/dashboard/00-overview-navigation.md`](./dashboard/00-overview-navigation.md) |
| 1 | **Trang Đăng nhập Quản trị (`LoginPage`)** — Chặn Khách hàng (403) | `/login` | Public (Kiểm tra quyền Admin khi login) | [`.feature/dashboard/01-login-page.md`](./dashboard/01-login-page.md) |
| 2 | **Trang Tổng quan (`DashboardHomePage`)** — Thống kê & Hồ sơ RBAC | `/` | `dashboard.view` | [`.feature/dashboard/02-dashboard-home-page.md`](./dashboard/02-dashboard-home-page.md) |
| 3 | **Trang Quản lý Người dùng (`UsersPage`)** — Admin, Nhân viên, Khách hàng | `/users` | `users.read` *(Thao tác: `users.create`, `users.update`)* | [`.feature/dashboard/03-users-management-page.md`](./dashboard/03-users-management-page.md) |
| 4 | **Trang Phân quyền RBAC (`RolesPage`)** — Vai trò & Ma trận Quyền hạn | `/roles` | `roles.read` *(Thao tác: `roles.manage`)* | [`.feature/dashboard/04-roles-permissions-page.md`](./dashboard/04-roles-permissions-page.md) |
| 5 | **Trang Danh mục & Sản phẩm (`Categories` / `Products`)** *(Giai đoạn tiếp theo)* | `/categories`, `/products` | `products.read` *(Thao tác: `products.manage`, `products.sync`)* | [`.feature/dashboard/05-products-categories-page.md`](./dashboard/05-products-categories-page.md) |

---

## 2. Tài Liệu Các Module Backend API Tương Ứng (`.feature/api/`)

| STT | Module API (`apps/api`) | Base Endpoint | File Tài Liệu Chi Tiết |
| :-: | :--- | :--- | :--- |
| 0 | **Chuẩn JSON Response & Hệ thống 3 Guards (`Jwt`, `Roles`, `Permissions`)** | `/api/*` | [`.feature/api/00-api-standard-and-guards.md`](./api/00-api-standard-and-guards.md) |
| 1 | **API Xác thực & Đăng nhập Admin / Storefront** | `/api/auth/*` | [`.feature/api/01-auth-api.md`](./api/01-auth-api.md) |
| 2 | **API Quản lý Tài khoản (Admin, Nhân viên, Khách hàng)** | `/api/users/*` | [`.feature/api/02-users-api.md`](./api/02-users-api.md) |
| 3 | **API Quản lý Vai trò & Ma trận Phân quyền (RBAC)** | `/api/roles/*` | [`.feature/api/03-roles-permissions-api.md`](./api/03-roles-permissions-api.md) |
| 4 | **API Danh mục & Sản phẩm chuẩn TikTok Shop `202405`** *(Giai đoạn tiếp theo)* | `/api/categories/*`, `/api/products/*` | [`.feature/api/04-catalog-tiktokshop-api.md`](./api/04-catalog-tiktokshop-api.md) |

---

## 3. Tóm Tắt Ma Trận Phân Quyền (Portal → Page → Action)

| Đối tượng | Đăng nhập Dashboard (`/login`) | Vào trang Tổng quan (`/`) | Vào trang Người dùng (`/users`) | Tạo / Khóa User (`users.create`, `users.update`) | Vào trang Phân quyền (`/roles`) | Sửa Ma trận Quyền (`roles.manage`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Admin (`SUPER_ADMIN`)** | ✅ Cho phép | ✅ Cho phép | ✅ Toàn quyền (Xem rõ mọi email) | ✅ Toàn quyền mọi Role | ✅ Cho phép | ✅ Cho phép |
| **Quản lý (`STORE_MANAGER`)** | ✅ Cho phép | ✅ Cho phép | ✅ Xem (Hash email `SUPER_ADMIN`) | ✅ Chỉ sửa cấp dưới (Chặn sửa/gán `SUPER_ADMIN` ở BE & FE) | ✅ Chỉ xem | ❌ Chặn sửa |
| **Nhân viên (`STAFF`)** | ✅ Cho phép | ✅ Cho phép | ❌ Ẩn menu & Chặn URL (403) | ❌ Chặn | ❌ Ẩn menu & Chặn URL (403) | ❌ Chặn |
| **Khách hàng (`CUSTOMER`)** | ❌ **Chặn ngay từ cổng Login (403)** | ❌ Chặn | ❌ Chặn | ❌ Chặn | ❌ Chặn | ❌ Chặn |

