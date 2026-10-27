# Trang Đăng Nhập Quản Trị — `LoginPage` (`/login`)

> **Route**: `/login`
> **Files liên quan**:
> - Page: [`apps/dashboard/src/pages/LoginPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/LoginPage.tsx)
> - Form Component: [`apps/dashboard/src/features/auth/components/AdminLoginForm.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/auth/components/AdminLoginForm.tsx)
> - API Hook: [`apps/dashboard/src/features/auth/hooks/useAuth.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/auth/hooks/useAuth.ts)
> - API Endpoint tương ứng: `POST /api/auth/admin/login` (Xem [`.feature/api/01-auth-api.md`](../api/01-auth-api.md))

---

## 1. Mục Đích & Quy Tắc Nghiệp Vụ

1. **Cổng đăng nhập dành riêng cho nhân sự nội bộ**:
   - Chỉ cho phép **Admin** (`SUPER_ADMIN`, `STORE_MANAGER`) và **Nhân viên** (`STAFF`) có cờ `isAdminPanel = true` hoặc có quyền `dashboard.view`.
2. **Chặn hoàn toàn Khách hàng (`CUSTOMER`)**:
   - Nếu người dùng nhập tài khoản thuộc nhóm Khách hàng (`customer@bonzstore.com`), dù đúng mật khẩu, API vẫn trả về lỗi `403 Forbidden`: *"Tài khoản này không có quyền truy cập vào trang Quản trị (Admin Dashboard)"*.
3. **Chặn tài khoản bị khóa (`LOCKED` / `INACTIVE`)**:
   - Nếu nhân viên nghỉ việc hoặc bị Admin khóa tài khoản (`status = LOCKED`), hệ thống từ chối đăng nhập ngay lập tức.

---

## 2. Các Thành Phần Giao Diện (UI Elements)

1. **Form đăng nhập**:
   - Ô nhập `Email Quản trị` (validate định dạng email).
   - Ô nhập `Mật khẩu` (tối thiểu 6 ký tự).
   - Hộp cảnh báo lỗi (`AlertCircle` màu đỏ `rose`) hiển thị thông báo lỗi trả về từ Backend.
   - Nút submit **`Đăng nhập vào Dashboard`** (`action-btn-primary`, tự động disable và hiện trạng thái loading khi đang gọi API).
2. **Khu vực chọn nhanh tài khoản mẫu (Demo RBAC Seed)**:
   - Nút **`Super Admin`**: Tự điền `admin@bonzstore.com` / `Admin@123` (vào Dashboard với toàn bộ quyền).
   - Nút **`Store Manager`**: Tự điền `manager@bonzstore.com` / `Manager@123` (vào Dashboard với quyền xem người dùng, xem quyền, quản lý sản phẩm/đơn hàng).
   - Nút **`Customer (403)`**: Tự điền `customer@bonzstore.com` / `Customer@123` để kiểm thử tính năng chặn khách hàng truy cập Admin.

---

## 3. Luồng Xử Lý Dữ Liệu (Data Flow)

```text
Người dùng nhập Email + Password
       │
       ▼
Gọi mutation useAdminLogin()  --->  POST /api/auth/admin/login
       │
       ├── Thất bại (401 / 403): Hiển thị banner lỗi màu đỏ ngay trên form
       │
       └── Thành công (200 OK):
             1. Lưu accessToken vào localStorage ('bonzstore_admin_token')
             2. Lưu refreshToken vào localStorage ('bonzstore_admin_refresh_token')
             3. Cập nhật state `user` (kèm `role` và mảng `permissions[]`) vào AuthContext
             4. Redirect sang trang Tổng quan `/`
```

