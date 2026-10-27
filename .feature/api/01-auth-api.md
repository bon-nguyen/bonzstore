# Đặc Tả API Xác Thực & Phiên Đăng Nhập — Module `Auth` (`/api/auth`)

> **Controller**: [`auth.controller.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/auth/auth.controller.ts)
> **Service**: [`auth.service.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/auth/auth.service.ts)
> **Trang Dashboard sử dụng**: [`LoginPage` (`/login`)](../dashboard/01-login-page.md), [`AppHeader`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/AppHeader.tsx), [`AuthContext`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/auth/context/AuthContext.tsx)

---

## Danh Sách Endpoints

### 1. `POST /api/auth/admin/login` — Đăng nhập Admin Dashboard
- **Quyền truy cập**: `@Public()`
- **Mục đích**: Xác thực tài khoản cho cổng **Admin Dashboard** (`apps/dashboard`).
- **Request Body (`LoginDto`)**:
  ```json
  {
    "email": "admin@bonzstore.com",
    "password": "Admin@123"
  }
  ```
- **Quy tắc kiểm tra nghiêm ngặt**:
  1. Kiểm tra email & mật khẩu (`bcrypt.compare`).
  2. Kiểm tra `user.status === 'ACTIVE'` (nếu `LOCKED` hoặc `INACTIVE` → trả về `403 Forbidden`).
  3. **Kiểm tra quyền vào Dashboard**: Bắt buộc `user.role.isAdminPanel === true` hoặc `user.role.code === 'SUPER_ADMIN'` hoặc có quyền `dashboard.view`.
  4. Nếu là tài khoản **Khách hàng (`CUSTOMER`)** → trả về `403 Forbidden`: *"Tài khoản này không có quyền truy cập vào trang Quản trị (Admin Dashboard)"*.
- **Response (`200 OK`)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "f47ac10b-58cc-4372-...",
    "expiresIn": "1d",
    "user": {
      "id": "uuid",
      "email": "admin@bonzstore.com",
      "fullName": "BonzStore Super Admin",
      "status": "ACTIVE",
      "role": {
        "id": "uuid",
        "code": "SUPER_ADMIN",
        "name": "Super Admin",
        "isAdminPanel": true
      },
      "permissions": [
        "dashboard.view",
        "users.read",
        "users.create",
        "users.update",
        "users.delete",
        "roles.read",
        "roles.manage",
        "products.read",
        "products.manage",
        "orders.read",
        "orders.manage"
      ]
    }
  }
  ```

---

### 2. `GET /api/auth/me` — Lấy Hồ Sơ & Quyền Hiện Tại
- **Quyền truy cập**: Yêu cầu `Bearer <accessToken>`
- **Mục đích**: Được `AuthProvider` trên Dashboard gọi mỗi khi tải lại trang (F5) để đồng bộ lại trạng thái tài khoản, vai trò và danh sách `permissions` mới nhất từ Database.

---

### 3. `POST /api/auth/refresh` — Làm Mới Access Token
- **Quyền truy cập**: `@Public()`
- **Request Body**: `{ "refreshToken": "..." }`
- **Mục đích**: Thu hồi Refresh Token cũ (`revoked = true`) và cấp cặp `accessToken` + `refreshToken` mới (Token Rotation).

---

### 4. `POST /api/auth/logout` — Đăng Xuất
- **Quyền truy cập**: Yêu cầu `Bearer <accessToken>`
- **Mục đích**: Đánh dấu `revoked = true` cho Refresh Token trong bảng `refresh_tokens`.

---

### 5. `POST /api/auth/login` & `POST /api/auth/register` — Dành cho Web Storefront
- Dành cho khách hàng (`CUSTOMER`) đăng ký và đăng nhập trên `apps/web` (cổng `3000`).

