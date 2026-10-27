# Tổng Quan Kiến Trúc & Điều Hướng — Admin Dashboard (`apps/dashboard`)

> **Thư mục code**: `apps/dashboard` (Vite + React + TailwindCSS + TanStack React Query + Tailwind Admin UI)
> **Cổng chạy mặc định**: `http://localhost:5173`
> **Đối tượng được phép truy cập**: Chỉ **Admin** (`SUPER_ADMIN`, `STORE_MANAGER`) và **Nhân viên** (`STAFF` có `isAdminPanel = true`). **Khách hàng** (`CUSTOMER`) bị chặn hoàn toàn.

---

## 1. Cấu Trúc Layout & Điều Hướng

Giao diện Dashboard sử dụng bộ CSS Component chuẩn trong [`apps/dashboard/src/index.css`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/index.css) và chia thành các thành phần chính:

- **[`MainLayout.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/MainLayout.tsx)**: Khung bố cục chính cho toàn bộ các trang sau khi đăng nhập.
- **[`AppSidebar.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/AppSidebar.tsx)** (Desktop) & **[`BottomNav.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/BottomNav.tsx)** (Mobile):
  - Tự động đọc danh sách `user.permissions` từ `AuthContext`.
  - **Chỉ hiển thị menu của những trang (Page)** mà tài khoản hiện tại được cấp quyền truy cập.
- **[`AppHeader.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/AppHeader.tsx)**:
  - Hiển thị Badge vai trò hiện tại (VD: `SUPER_ADMIN`, `STORE_MANAGER`, `STAFF`), họ tên, email và nút **Đăng xuất**.

---

## 2. Sơ Đồ Các Trang (Pages Map) & Quyền Truy Cập Trang (Page Access)

| STT | Đường dẫn (Route) | Tên Trang (Page Component) | Quyền Truy Cập Trang (`requiredPermission`) | Ai được vào mặc định? | Tài liệu chi tiết |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `/login` | [`LoginPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/LoginPage.tsx) | Public (Kiểm tra `isAdminPanel` khi submit) | Admin, Nhân viên | [01-login-page.md](./01-login-page.md) |
| 2 | `/` | [`DashboardHomePage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/DashboardHomePage.tsx) | `dashboard.view` | Admin, Quản lý, Nhân viên | [02-dashboard-home-page.md](./02-dashboard-home-page.md) |
| 3 | `/users` | [`UsersPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/UsersPage.tsx) | `users.read` | Super Admin, Quản lý | [03-users-management-page.md](./03-users-management-page.md) |
| 4 | `/roles` | [`RolesPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/RolesPage.tsx) | `roles.read` | Super Admin, Quản lý | [04-roles-permissions-page.md](./04-roles-permissions-page.md) |
| 5 | `/forbidden` | [`ForbiddenPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ForbiddenPage.tsx) | Đã đăng nhập | Hiển thị khi thiếu quyền vào trang | — |
| 6 | `/products` *(Sắp tới)* | `ProductsPage.tsx` | `products.read` | Admin, Quản lý, Nhân viên SP | [05-products-categories-page.md](./05-products-categories-page.md) |

---

## 3. Cơ Chế Kiểm Tra Quyền Trên Dashboard (2 Lớp Frontend)

### Lớp A — Kiểm tra Quyền Truy Cập Trang (`ProtectedRoute`)
File: [`ProtectedRoute.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/auth/components/ProtectedRoute.tsx)
```tsx
<ProtectedRoute requiredPermission="users.read">
  <UsersPage />
</ProtectedRoute>
```
1. Nếu chưa đăng nhập (`!isAuthenticated`) → Tự động chuyển hướng về `/login`.
2. Nếu đã đăng nhập nhưng không có quyền `users.read` (và không phải `SUPER_ADMIN`) → Tự động chuyển hướng sang `/forbidden` (`403 — Không đủ quyền truy cập`).

### Lớp B — Kiểm tra Quyền Thao Tác Trong Trang (`PermissionGate`)
File: [`PermissionGate.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/auth/components/PermissionGate.tsx)
```tsx
<PermissionGate permission="users.create">
  <button className="action-btn-primary">+ Thêm tài khoản</button>
</PermissionGate>
```
1. Cho phép cùng một trang `/users`, **Super Admin** nhìn thấy và bấm được nút `+ Thêm tài khoản`, đổi Role, Khóa tài khoản.
2. Trong khi đó **Quản lý (`STORE_MANAGER`)** hoặc **Nhân viên** chỉ có quyền `users.read` sẽ chỉ xem được bảng danh sách ở chế độ **Read-only** (các nút thao tác tự động ẩn hoặc chuyển thành văn bản tĩnh).

