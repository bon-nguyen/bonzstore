# Đặc Tả API Quản Lý Người Dùng — Module `Users` (`/api/users`)

> **Controller**: [`users.controller.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/users.controller.ts)
> **Service**: [`users.service.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/users.service.ts)
> **DTOs**: [`user-query.dto.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/dto/user-query.dto.ts), [`create-user.dto.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/dto/create-user.dto.ts), [`update-user.dto.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/dto/update-user.dto.ts)
> **Trang Dashboard sử dụng**: [`DashboardHomePage` (`/`)](../dashboard/02-dashboard-home-page.md), [`UsersPage` (`/users`)](../dashboard/03-users-management-page.md)

---

## 1. Danh Sách Endpoints & Phân Quyền

| Method & Endpoint | Permission Yêu Cầu | Quy Tắc Phân Cấp Bậc (`Role Rank`) | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET /api/users/stats` | `users.read` | Cho phép Admin & Manager | Thống kê tổng số user, số user `ACTIVE`, `LOCKED`, và số nhân sự Admin (`isAdminPanel = true`) |
| `GET /api/users` | `users.read` | Nếu người gọi `< SUPER_ADMIN`, tự động **hash/mask email & SĐT** của các tài khoản `SUPER_ADMIN` | Lấy danh sách tài khoản (mặc định sort theo `role`, phân trang **tối đa 20 bản ghi/lần**) |
| `GET /api/users/:id` | `users.read` | Nếu người gọi `< SUPER_ADMIN`, tự động **hash/mask email & SĐT** nếu xem `SUPER_ADMIN` | Xem chi tiết hồ sơ người dùng kèm số phiên hoạt động (`activeSessions`) và danh sách quyền |
| `POST /api/users` | `users.create` | Chặn `403 Forbidden` nếu người gọi `!= SUPER_ADMIN` cố tình tạo user có quyền `SUPER_ADMIN` | Tạo mới tài khoản và gán Role |
| `PATCH /api/users/:id` | `users.update` | Chặn `403 Forbidden` nếu `STORE_MANAGER` cố sửa/khóa tài khoản `SUPER_ADMIN` hoặc nâng quyền lên `SUPER_ADMIN` | Chỉnh sửa thông tin (`fullName`, `phone`, `roleIdOrCode`, `status`) |
| `PATCH /api/users/:id/reset-password` | `users.update` | Chặn `403 Forbidden` nếu `STORE_MANAGER` cố reset mật khẩu của `SUPER_ADMIN` | Đặt lại mật khẩu mới (`newPassword`) và xóa toàn bộ `refreshTokens` cũ của user đó |

---

## 2. Cơ Chế Bảo Vệ Phân Cấp Bậc & Hash Email Ở Backend (`UsersService`)

### 2.1 Thứ Bậc Vai Trò (`ROLE_RANK`)
```ts
const ROLE_RANK: Record<string, number> = {
  SUPER_ADMIN: 100, // Toàn quyền trên toàn bộ hệ thống
  STORE_MANAGER: 50, // Quản lý cửa hàng (chỉ thao tác với cấp thấp hơn SUPER_ADMIN)
  STAFF: 20,
  CUSTOMER: 10,
};
```

### 2.2 Tự Động Mã Hóa / Hash Email Cấp Cao Hơn (`maskEmailForLowerRole`)
- Khi một người dùng có quyền thấp hơn `SUPER_ADMIN` (ví dụ `STORE_MANAGER` — `manager@bonzstore.com`) gọi `GET /api/users` hoặc `GET /api/users/:id`:
  - Mọi bản ghi có vai trò `SUPER_ADMIN` (ví dụ `admin@bonzstore.com`) sẽ được Backend tự động che/hash email bằng SHA-256 ngắn:
    - `email`: `"ad***#7c4a@bonzstore.com"`
    - `phone`: `"090****567"`
    - `isEmailMasked`: `true`
    - `canManage`: `false`

### 2.3 Chặn Escalation & Bảo Vệ `SUPER_ADMIN` Tại Backend (`403 Forbidden`)
- Trong `POST /api/users`, `PATCH /api/users/:id` và `PATCH /api/users/:id/reset-password`:
  1. Nếu `currentUser.role.code !== 'SUPER_ADMIN'` mà target user đang có role `SUPER_ADMIN` -> Ném lỗi `403 ForbiddenException`.
  2. Nếu `currentUser.role.code !== 'SUPER_ADMIN'` mà truyền `roleIdOrCode: "SUPER_ADMIN"` -> Ném lỗi `403 ForbiddenException`.

---

## 3. Chi Tiết Các Endpoint Mới Bổ Sung

### 3.1 `GET /api/users/:id` (Xem chi tiết người dùng)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": "uuid",
      "email": "staff@bonzstore.com",
      "isEmailMasked": false,
      "canManage": true,
      "fullName": "Lê Nhân Viên Vận Hành",
      "phone": "0903456789",
      "status": "ACTIVE",
      "lastLoginAt": "2026-10-28T15:30:00.000Z",
      "createdAt": "2026-10-28T10:00:00.000Z",
      "updatedAt": "2026-10-28T15:30:00.000Z",
      "activeSessions": 1,
      "role": {
        "id": "uuid",
        "code": "STAFF",
        "name": "Nhân viên vận hành",
        "description": "Nhân viên xem sản phẩm, kiểm tra tồn kho và xử lý đơn hàng",
        "isAdminPanel": true
      },
      "permissions": ["dashboard.view", "products.read", "orders.read", "orders.manage"]
    }
  }
  ```

### 3.2 `PATCH /api/users/:id` (Chỉnh sửa thông tin người dùng)
- **Request Body (`UpdateUserDto`)**:
  ```json
  {
    "fullName": "Lê Nhân Viên (Ca Sáng)",
    "phone": "0903456999",
    "roleIdOrCode": "STAFF",
    "status": "ACTIVE"
  }
  ```

### 3.3 `PATCH /api/users/:id/reset-password` (Reset mật khẩu & Thu hồi phiên)
- **Request Body (`ResetUserPasswordDto`)**:
  ```json
  {
    "newPassword": "Bonz@8492"
  }
  ```
- **Xử lý Transaction ở Backend**:
  - Mã hóa `newPassword` với `bcrypt.hash(newPassword, 10)`.
  - Thực thi `$transaction`: Cập nhật `passwordHash` mới đồng thời xóa toàn bộ `refreshTokens` của user đó để buộc đăng nhập lại bằng mật khẩu mới.
