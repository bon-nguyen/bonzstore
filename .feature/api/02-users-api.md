# Đặc Tả API Quản Lý Người Dùng — Module `Users` (`/api/users`)

> **Controller**: [`users.controller.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/users.controller.ts)
> **Service**: [`users.service.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/users.service.ts)
> **Query DTO**: [`user-query.dto.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/dto/user-query.dto.ts)
> **Trang Dashboard sử dụng**: [`DashboardHomePage` (`/`)](../dashboard/02-dashboard-home-page.md), [`UsersPage` (`/users`)](../dashboard/03-users-management-page.md)

---

## 1. Danh Sách Endpoints & Phân Quyền

| Method & Endpoint | Permission Yêu Cầu | Quy Tắc Phân Cấp Bậc (`Role Rank`) | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET /api/users/stats` | `users.read` | Cho phép Admin & Manager | Thống kê tổng số user, số user `ACTIVE`, `LOCKED`, và số nhân sự Admin (`isAdminPanel = true`) |
| `GET /api/users` | `users.read` | Nếu người gọi `< SUPER_ADMIN`, tự động **hash/mask email & SĐT** của các tài khoản `SUPER_ADMIN` | Lấy danh sách tài khoản (mặc định sort theo `role`, phân trang **tối đa 20 bản ghi/lần**) |
| `POST /api/users` | `users.create` | Chặn `403 Forbidden` nếu người gọi `!= SUPER_ADMIN` cố tình tạo user có quyền `SUPER_ADMIN` | Tạo mới tài khoản và gán Role |
| `PATCH /api/users/:id` | `users.update` | Chặn `403 Forbidden` nếu `STORE_MANAGER` cố sửa/khóa tài khoản `SUPER_ADMIN` hoặc nâng quyền lên `SUPER_ADMIN` | Đổi Role, cập nhật thông tin hoặc Khóa (`LOCKED`) / Mở khóa (`ACTIVE`) |

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
- Khi một người dùng có quyền thấp hơn `SUPER_ADMIN` (ví dụ `STORE_MANAGER` — `manager@bonzstore.com`) gọi `GET /api/users`:
  - Mọi bản ghi có vai trò `SUPER_ADMIN` (ví dụ `admin@bonzstore.com`) sẽ được Backend tự động che/hash email bằng SHA-256 ngắn:
    - `email`: `"ad***#7c4a@bonzstore.com"`
    - `phone`: `"090****567"`
    - `isEmailMasked`: `true`
    - `canManage`: `false`
- Chỉ khi đăng nhập bằng tài khoản `SUPER_ADMIN` mới nhìn thấy đầy đủ `"admin@bonzstore.com"` và `canManage: true`.

### 2.3 Chặn Escalation & Bảo Vệ `SUPER_ADMIN` Tại Backend (`403 Forbidden`)
- Trong `POST /api/users` và `PATCH /api/users/:id`:
  1. Nếu `currentUser.role.code !== 'SUPER_ADMIN'` mà target user đang có role `SUPER_ADMIN` -> Ném lỗi `403 ForbiddenException`:
     > `"Tài khoản STORE_MANAGER không đủ thẩm quyền thao tác trên tài khoản cấp cao hơn (SUPER_ADMIN)"`
  2. Nếu `currentUser.role.code !== 'SUPER_ADMIN'` mà truyền `roleIdOrCode: "SUPER_ADMIN"` -> Ném lỗi `403 ForbiddenException`:
     > `"Không thể gán vai trò SUPER_ADMIN. Chỉ SUPER_ADMIN mới có toàn quyền phân cấp này."`

---

## 3. Chi Tiết Các Endpoint

### 3.1 `GET /api/users`
- **Kiểm tra dữ liệu (`lodash`)**: Sử dụng `isEmpty`, `isNil`, `trim` từ `lodash` để làm sạch tham số tìm kiếm và bộ lọc.
- **Query Params (`UserQueryDto`)**:
  - `page`: Trang hiện tại (mặc định `1`, tối thiểu `1`).
  - `limit`: Số bản ghi mỗi trang (mặc định `20`, **tối đa `20`** — được khóa bởi `@Max(20)` và `Math.min(limit, 20)`).
  - `search`: Tìm theo `email`, `fullName`, hoặc tên/mã `role` (không phân biệt hoa thường).
  - `status`: `ACTIVE` | `INACTIVE` | `LOCKED`.
  - `roleCode`: Lọc theo mã vai trò (`SUPER_ADMIN`, `STORE_MANAGER`, `STAFF`, `CUSTOMER`).
  - `sortBy`: Mặc định là `'role'` (Hỗ trợ: `'role' | 'status' | 'createdAt' | 'fullName' | 'email'`).
  - `sortOrder`: Mặc định là `'asc'` (`'asc' | 'desc'`).
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": "uuid",
        "email": "ad***#7c4a@bonzstore.com",
        "isEmailMasked": true,
        "canManage": false,
        "fullName": "BonzStore Super Admin",
        "status": "ACTIVE",
        "role": {
          "id": "uuid",
          "code": "SUPER_ADMIN",
          "name": "Super Admin",
          "isAdminPanel": true
        },
        "permissions": ["dashboard.view", "users.read", "users.create", "users.update"]
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 26,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "sortBy": "role",
      "sortOrder": "asc"
    }
  }
  ```

### 3.2 `POST /api/users`
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

### 3.3 `PATCH /api/users/:id`
- **Request Body (`UpdateUserDto`)**:
  - Đổi vai trò: `{ "roleIdOrCode": "STORE_MANAGER" }` *(Chặn 403 nếu `STORE_MANAGER` cố gán `SUPER_ADMIN`)*
  - Khóa tài khoản: `{ "status": "LOCKED" }` *(Chặn 403 nếu đối tượng bị khóa là `SUPER_ADMIN`)*
  - Mở khóa tài khoản: `{ "status": "ACTIVE" }`
