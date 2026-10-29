# BonzStore Monorepo

Hệ thống thương mại điện tử & quản trị theo kiến trúc Monorepo (Turborepo + Docker Compose), tuân thủ bộ quy tắc trong `.agents/skills` và tài liệu đặc tả tính năng tại [`.feature/docs.md`](file:///c:/Users/Admin/Desktop/bonzstore/.feature/docs.md).

## 1. Cấu trúc `apps/`

- **`apps/api`**: Backend REST API sử dụng **NestJS + Prisma + PostgreSQL + Docker**, tích hợp xác thực JWT (Access/Refresh Token), phân quyền RBAC 3 lớp (`JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`), quản lý Sản phẩm / Danh mục (`202405`) / Thẻ sản phẩm chuẩn TikTok Shop và hệ thống Thông báo Admin tự động theo sự kiện `CREATE` / `UPDATE` / `DELETE`.
- **`apps/dashboard`**: Trang Quản trị Admin sử dụng **Vite + React + TailwindCSS + TanStack React Query + Tailwind Admin UI** (cổng `5173`), hỗ trợ song ngữ `VI / EN`, giao diện Sáng / Tối, Chuông thông báo thời gian thực và cài đặt thông báo theo tác vụ Thêm / Sửa / Xóa.
- **`apps/web`**: Trang Storefront cho khách hàng sử dụng **Next.js (App Router) + TailwindCSS + TanStack React Query** (cổng `3000`).

---

## 2. Tài khoản mặc định (sau khi chạy Seed)

| Vai trò (`ROLES`) | Email | Mật khẩu | Quyền truy cập Admin Dashboard |
| :--- | :--- | :--- | :--- |
| **Super Admin (`SUPER_ADMIN`)** | `admin@bonzstore.com` | `Admin@123` | Toàn quyền hệ thống (`SUPER_ADMIN`) |
| **Store Manager (`STORE_MANAGER`)** | `manager@bonzstore.com` | `Manager@123` | Cho phép (`dashboard.view`, `users.read`, `roles.read`, `products.*`, cấu hình thông báo) |
| **Staff (`STAFF`)** | `staff.tokyo@bonzstore.com` | `Staff@123` | Cho phép xem Tổng quan, Sản phẩm, Danh mục, Thẻ (chế độ Read-only với Danh mục & Thẻ) |
| **Customer (`CUSTOMER`)** | `customer@bonzstore.com` | `Customer@123` | Bị chặn ở `/api/auth/admin/login` (403 Forbidden), chỉ đăng nhập được ở Web Storefront |

---

## 3. Tài liệu Tính năng Chi tiết (`.feature/`)

Xem mục lục đầy đủ tại **[`.feature/docs.md`](file:///c:/Users/Admin/Desktop/bonzstore/.feature/docs.md)**:
- **Dashboard Pages**:
  - [Tổng quan Layout, Sidebar, Chuông Thông báo & RBAC Frontend](file:///c:/Users/Admin/Desktop/bonzstore/.feature/dashboard/00-overview-navigation.md)
  - [Trang Đăng nhập Quản trị (`/login`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/dashboard/01-login-page.md)
  - [Trang Tổng quan (`/`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/dashboard/02-dashboard-home-page.md)
  - [Trang Quản lý Người dùng (`/users`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/dashboard/03-users-management-page.md)
  - [Trang Phân quyền RBAC (`/roles`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/dashboard/04-roles-permissions-page.md)
  - [Phân hệ Sản phẩm, Danh mục (`202405`) & Thẻ (`/products`, `/categories`, `/tags`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/dashboard/05-products-categories-page.md)
  - [Chuông Thông báo Admin & Trang Cài đặt Thông báo (`/settings/notifications`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/dashboard/06-notifications-settings-page.md)
- **Backend API Modules**:
  - [Chuẩn JSON Response & 3 Guards](file:///c:/Users/Admin/Desktop/bonzstore/.feature/api/00-api-standard-and-guards.md)
  - [API Xác thực (`/api/auth`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/api/01-auth-api.md)
  - [API Quản lý Người dùng (`/api/users`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/api/02-users-api.md)
  - [API Phân quyền RBAC (`/api/roles`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/api/03-roles-permissions-api.md)
  - [API Danh mục, Sản phẩm & Thẻ chuẩn TikTok Shop `202405` (`/api/categories`, `/api/products`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/api/04-catalog-tiktokshop-api.md)
  - [API Thông báo Admin & Cấu hình Sự kiện Thêm / Sửa / Xóa (`/api/notifications`)](file:///c:/Users/Admin/Desktop/bonzstore/.feature/api/05-notifications-api.md)

---

## 4. Hướng dẫn khởi chạy

### Cách 1: Chạy Local Development (Docker cho DB + Turborepo)
```bash
# 1. Cài đặt dependencies
yarn install

# 2. Khởi chạy PostgreSQL & Redis qua Docker
yarn docker:dev

# 3. Khởi tạo Prisma Client, đẩy schema & chạy dữ liệu mẫu RBAC
yarn db:generate
npx --yes prisma db push --schema=apps/api/prisma/schema.prisma
yarn db:seed

# 4. Chạy đồng thời API (4000), Dashboard (5173) và Web (3000)
yarn dev
```

### Cách 2: Chạy toàn bộ bằng Docker Compose
```bash
docker compose up --build -d
```

- **Backend API & Swagger**: `http://localhost:4000/api/docs`
- **Admin Dashboard (Vite)**: `http://localhost:5173`
- **Web Storefront (Next.js)**: `http://localhost:3000`
