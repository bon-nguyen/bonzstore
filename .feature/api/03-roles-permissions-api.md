# Đặc Tả API Vai Trò & Phân Quyền Động — Module `Roles` (`/api/roles`)

> **Controller**: [`roles.controller.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/roles/roles.controller.ts)
> **Service**: [`roles.service.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/roles/roles.service.ts)
> **Trang Dashboard sử dụng**: [`RolesPage` (`/roles`)](../dashboard/04-roles-permissions-page.md), [`UsersPage` (`/users`)](../dashboard/03-users-management-page.md)

---

## Danh Sách Endpoints & Phân Quyền

| Method & Endpoint | Permission Yêu Cầu | Trang Dashboard Gọi | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET /api/roles` | `roles.read` | `/roles`, `/users`, `/` | Danh sách tất cả các Role kèm số lượng user (`userCount`) và danh sách `permissionCodes` |
| `GET /api/roles/permissions` | `roles.read` | `/roles` (`RolesPage`) | Danh mục toàn bộ các quyền hạn (`Permissions Catalog`) chia theo `module` |
| `POST /api/roles` | `roles.manage` | `/roles` (`RolesPage`) | Tạo mới một Role (VD: `CONTENT_STAFF`, `WAREHOUSE_STAFF`) và gán tập quyền ban đầu |
| `PATCH /api/roles/:id` | `roles.manage` | `/roles` (`RolesPage`) | Cập nhật thông tin Role hoặc cập nhật mảng `permissionCodes` (Transaction xóa cũ - thêm mới trong `role_permissions`) |

---

## Chi Tiết Các Endpoint

### 1. `GET /api/roles`
- **Response (`200 OK`)**:
  ```json
  [
    {
      "id": "uuid",
      "code": "STORE_MANAGER",
      "name": "Quản lý cửa hàng",
      "description": "Quản lý sản phẩm, đơn hàng và nhân viên",
      "isSystem": true,
      "isAdminPanel": true,
      "status": "ACTIVE",
      "userCount": 1,
      "permissionCodes": [
        "dashboard.view",
        "users.read",
        "roles.read",
        "products.read",
        "products.manage",
        "orders.read",
        "orders.manage"
      ]
    }
  ]
  ```

### 2. `PATCH /api/roles/:id` — Cập Nhật Ma Trận Quyền Của Role
- **Request Body (`UpdateRoleDto`)**:
  ```json
  {
    "permissionCodes": [
      "dashboard.view",
      "products.read",
      "orders.read",
      "orders.manage"
    ]
  }
  ```
- **Cơ chế xử lý**: Sử dụng `prisma.$transaction` để cập nhật bảng trung gian `role_permissions` một cách toàn vẹn (atomic). Ngay khi cập nhật xong, các nhân viên thuộc Role này sẽ nhận bộ quyền mới trong phiên làm việc.

