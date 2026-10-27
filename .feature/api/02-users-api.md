# Đặc Tả API Quản Lý Người Dùng — Module `Users` (`/api/users`)

> **Controller**: [`users.controller.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/users.controller.ts)
> **Service**: [`users.service.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/users.service.ts)
> **Trang Dashboard sử dụng**: [`DashboardHomePage` (`/`)](../dashboard/02-dashboard-home-page.md), [`UsersPage` (`/users`)](../dashboard/03-users-management-page.md)

---

## Danh Sách Endpoints & Phân Quyền

| Method & Endpoint | Permission Yêu Cầu | Trang Dashboard Gọi | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET /api/users/stats` | `users.read` | `/` (`DashboardHomePage`) | Thống kê tổng số user, số user `ACTIVE`, `LOCKED`, và số nhân sự Admin (`isAdminPanel = true`) |
| `GET /api/users` | `users.read` | `/users` (`UsersPage`) | Lấy danh sách tài khoản (Admin, Nhân viên, Khách hàng) có phân trang, tìm kiếm & lọc |
| `POST /api/users` | `users.create` | `/users` (`UsersPage`) | Admin tạo mới tài khoản Nhân viên / Quản lý và gán Role |
| `PATCH /api/users/:id` | `users.update` | `/users` (`UsersPage`) | Đổi Role, cập nhật thông tin, đặt lại mật khẩu, hoặc Khóa (`LOCKED`) / Mở khóa (`ACTIVE`) |

---

## Chi Tiết Các Endpoint

### 1. `GET /api/users/stats`
- **Response (`200 OK`)**:
  ```json
  {
    "total": 3,
    "active": 3,
    "locked": 0,
    "adminUsers": 2
  }
  ```

### 2. `GET /api/users`
- **Query Params (`UserQueryDto`)**:
  - `page` (mặc định `1`), `limit` (mặc định `10`)
  - `search`: Tìm theo `email` hoặc `fullName`
  - `status`: `ACTIVE` | `INACTIVE` | `LOCKED`
  - `roleCode`: Lọc theo mã vai trò (VD: `SUPER_ADMIN`, `STORE_MANAGER`, `STAFF`, `CUSTOMER`)
- **Kỹ thuật tối ưu**: Sử dụng `Promise.all([findMany, count])` chạy song song để giảm thời gian phản hồi.

### 3. `POST /api/users`
- **Request Body (`CreateUserDto`)**:
  ```json
  {
    "email": "staff01@bonzstore.com",
    "password": "Staff@123",
    "fullName": "Lê Nhân Viên",
    "phone": "0909888777",
    "roleIdOrCode": "STAFF",
    "status": "ACTIVE"
  }
  ```

### 4. `PATCH /api/users/:id`
- **Request Body (`UpdateUserDto`)**:
  - Đổi vai trò: `{ "roleIdOrCode": "STORE_MANAGER" }`
  - Khóa tài khoản: `{ "status": "LOCKED" }`
  - Mở khóa tài khoản: `{ "status": "ACTIVE" }`

