# Trang Tổng Quan Quản Trị — `DashboardHomePage` (`/`)

> **Route**: `/`
> **Quyền truy cập trang (`ProtectedRoute`)**: `dashboard.view`
> **Files liên quan**:
> - Page: [`apps/dashboard/src/pages/DashboardHomePage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/DashboardHomePage.tsx)
> - Hooks: [`useUserStats()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/hooks/useUsers.ts), [`useRoles()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/roles/hooks/useRoles.ts), [`useAuthContext()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/auth/context/AuthContext.tsx)
> - API Endpoints gọi: `GET /api/auth/me`, `GET /api/users/stats`, `GET /api/roles`

---

## 1. Mục Đích

- Là màn hình đầu tiên sau khi **Admin** hoặc **Nhân viên** đăng nhập thành công.
- Hiển thị các chỉ số thống kê nhanh về nhân sự/tài khoản hệ thống.
- Hiển thị minh bạch **Hồ sơ Phân quyền (RBAC Profile)** của chính tài khoản đang đăng nhập để dễ dàng kiểm tra quyền truy cập trang & quyền thao tác.

---

## 2. Các Thành Phần Giao Diện (UI Sections)

### 2.1 Header Trang (`PageHeader`)
- Tiêu đề chào mừng theo tên người dùng đăng nhập (`Xin chào, [fullName]`).
- Nút hành động nhanh **`Cấu hình RBAC`** dẫn tới trang `/roles`.

### 2.2 Khối 4 Thẻ Thống Kê (`stat-card` & `stat-card-icon`)
1. **Tổng tài khoản**: Tổng số user trong DB (`Admin` + `Nhân viên` + `Khách hàng`).
2. **Đang hoạt động**: Số lượng tài khoản có trạng thái `ACTIVE`.
3. **Nhân sự Admin Panel**: Số lượng tài khoản thuộc nhóm `Admin` và `Nhân viên` (`role.isAdminPanel = true`).
4. **Vai trò (Roles)**: Tổng số nhóm vai trò hiện có trong hệ thống.

### 2.3 Khối Thông Tin Phiên Đăng Nhập & Quyền Hạn Hiện Tại
- Hiển thị thông tin lấy từ `GET /api/auth/me`:
  - **Email**, **Vai trò (`role.name` / `role.code`)**, **Trạng thái (`StatusBadge`)**.
  - **Quyền truy cập Admin Panel**: `isAdminPanel = true`.
  - **Danh sách các mã Permission được cấp**: Render dưới dạng các badge `status-badge status-active` (ví dụ: `dashboard.view`, `users.read`, `products.manage`...).

