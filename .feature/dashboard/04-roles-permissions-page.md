# Trang Quản Lý Vai Trò & Ma Trận Phân Quyền RBAC — `RolesPage` (`/roles`)

> **Route**: `/roles`
> **Quyền truy cập trang (`ProtectedRoute`)**: `roles.read`
> **Files liên quan**:
> - Page: [`apps/dashboard/src/pages/RolesPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/RolesPage.tsx)
> - Hooks: [`useRoles()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/roles/hooks/useRoles.ts), [`usePermissionsCatalog()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/roles/hooks/useRoles.ts), [`useCreateRole()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/roles/hooks/useRoles.ts), [`useUpdateRole()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/roles/hooks/useRoles.ts)
> - API Endpoints tương ứng: `GET /api/roles`, `GET /api/roles/permissions`, `POST /api/roles`, `PATCH /api/roles/:id` (Xem [`.feature/api/03-roles-permissions-api.md`](../api/03-roles-permissions-api.md))

---

## 1. Mục Đích

Đây là trung tâm điều khiển **Authorization (Phân quyền động)** của toàn bộ hệ thống BonzStore:
- Cho phép Admin định nghĩa thêm các nhóm nhân viên mới (VD: `CONTENT_STAFF`, `WAREHOUSE_STAFF`, `MARKETING_STAFF`...).
- Cho phép cấu hình trực quan **Role nào được vào Trang nào (Page Access)** và **được bấm Nút thao tác nào (Action Access)** thông qua bảng checkbox Ma trận Quyền hạn.

---

## 2. Bố Cục Giao Diện 2 Cột (Master - Detail)

### 2.1 Cột Trái (4/12): Danh Sách Các Vai Trò (`Roles List`)
Hiển thị danh sách các thẻ `stat-card` đại diện cho từng Role:
- **Tên hiển thị & Mã Role** (VD: `Super Admin` — `SUPER_ADMIN`, `Nhân viên vận hành` — `STAFF`).
- **Badge trạng thái**: `ACTIVE` / `INACTIVE`.
- **Thống kê trên từng Role**:
  - Số lượng tài khoản đang thuộc Role này (`userCount`).
  - Tổng số quyền hạn đã cấp (`permissionCodes.length`).

### 2.2 Cột Phải (8/12): Ma Trận Quyền Hạn (`Permission Matrix`)
Khi bấm chọn một Role ở cột trái, cột phải sẽ hiển thị toàn bộ danh mục quyền hạn (`Permissions Catalog`) kèm trạng thái bật/tắt (`checkbox`):
- **Hiển thị loại cổng truy cập**: Badge `Cho phép vào Admin` (`isAdminPanel = true`) hoặc `Storefront Only` (`isAdminPanel = false`).
- **Danh sách các thẻ Permission**:
  - Tên quyền tiếng Việt (VD: *Xem danh sách người dùng*, *Tạo người dùng mới*, *Quản lý sản phẩm*...).
  - Mã quyền kỹ thuật (`users.read`, `users.create`, `products.manage`...).
  - Mô tả phạm vi ảnh hưởng (quyền truy cập trang hay quyền thao tác).
- **Cập nhật tức thì (Real-time Toggle)**:
  - Khi Admin (có quyền `roles.manage`) bấm vào một ô quyền, hệ thống gọi ngay `PATCH /api/roles/:id` để cập nhật bảng `role_permissions` trong PostgreSQL.

---

## 3. Ma Trận Phân Quyền Trên Chính Trang `/roles`

| Thao tác | Mã Quyền Yêu Cầu | Mô tả |
| :--- | :--- | :--- |
| **Vào trang `/roles` & xem ma trận** | `roles.read` | Cho phép xem danh sách các Role và từng Role đang có những quyền gì |
| **Tạo Vai trò mới (`+ Tạo Vai trò mới`)** | `roles.manage` | Bảo vệ bởi `<PermissionGate permission="roles.manage">` và `@RequirePermissions('roles.manage')` |
| **Bật / Tắt từng Permission trong ma trận** | `roles.manage` | Chỉ người có quyền `roles.manage` (hoặc `SUPER_ADMIN`) mới lưu được thay đổi xuống API |

