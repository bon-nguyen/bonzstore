# Trang Quản Lý Người Dùng (Admin, Nhân Viên, Khách Hàng) — `UsersPage` (`/users`)

> **Route**: `/users`
> **Quyền truy cập trang (`ProtectedRoute`)**: `users.read`
> **Files liên quan**:
> - Page: [`apps/dashboard/src/pages/UsersPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/UsersPage.tsx)
> - Hooks: [`useUsers()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/hooks/useUsers.ts), [`useCreateUser()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/hooks/useUsers.ts), [`useUpdateUser()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/hooks/useUsers.ts)
> - API Endpoints tương ứng: `GET /api/users`, `POST /api/users`, `PATCH /api/users/:id` (Xem [`.feature/api/02-users-api.md`](../api/02-users-api.md))

---

## 1. Mục Đích & Phân Loại Tài Khoản Quản Lý

Trang `/users` cho phép quản lý tập trung cả **3 nhóm đối tượng** trong hệ thống:
1. **Admin (`SUPER_ADMIN`, `STORE_MANAGER`)**: Tài khoản quản trị cấp cao và quản lý cửa hàng.
2. **Nhân viên (`STAFF` và các Role nhân viên tùy chỉnh)**: Nhân viên vận hành, nhân viên sản phẩm, nhân viên kho... được tạo từ Dashboard để vào làm việc.
3. **Khách hàng (`CUSTOMER`)**: Tài khoản đăng ký từ trang Web bán hàng (`apps/web`). Admin có thể tra cứu hoặc khóa tài khoản khách hàng vi phạm.

---

## 2. Ma Trận Phân Quyền Truy Cập & Thao Tác Trên Trang `/users`

| Thao tác trên giao diện | Mã Quyền Yêu Cầu | Thành phần bảo vệ | Hành vi khi KHÔNG có quyền |
| :--- | :--- | :--- | :--- |
| **Vào trang `/users` & xem bảng** | `users.read` | `<ProtectedRoute requiredPermission="users.read">` | Ẩn menu trên Sidebar; nếu gõ URL trực tiếp sẽ bị đẩy sang `/forbidden` (`403`) |
| **Bấm nút `+ Thêm tài khoản`** | `users.create` | `<PermissionGate permission="users.create">` | Tự động ẩn nút `+ Thêm tài khoản` trên góc phải `PageHeader` |
| **Đổi Vai trò (Role Dropdown)** | `users.update` | `<PermissionGate permission="users.update">` | Không hiện ô `<select>`, chỉ hiển thị tên Role dạng chữ tĩnh (Read-only) |
| **Khóa / Mở khóa tài khoản** | `users.update` | `<PermissionGate permission="users.update">` | Ẩn nút icon Khóa/Mở khóa (`Lock` / `Unlock`) ở cột Thao tác |

---

## 3. Các Tính Năng Chi Tiết Trên Trang

### 3.1 Bộ Lọc & Tìm Kiếm (`.filter-panel`)
- **Tìm kiếm từ khóa (`search`)**: Tìm theo Họ tên hoặc Email (không phân biệt hoa thường).
- **Lọc theo trạng thái (`status`)**:
  - `ACTIVE` (Đang hoạt động)
  - `LOCKED` (Đã khóa — không thể đăng nhập)
  - `INACTIVE` (Ngừng hoạt động)

### 3.2 Bảng Dữ Liệu Thích Ứng (`ResponsiveTable`)
- Trên **Desktop**: Hiển thị bảng tiêu chuẩn với hiệu ứng hover hàng `.table-row-interactive`.
- Trên **Mobile**: Tự động chuyển thành danh sách thẻ (`stat-card` stack).
- Các cột hiển thị:
  1. **Người dùng**: Họ tên + Email.
  2. **Vai trò (RBAC Role)**: Cho phép đổi trực tiếp giữa `SUPER_ADMIN`, `STORE_MANAGER`, `STAFF`, `CUSTOMER` hoặc các Role mới tạo.
  3. **Trạng thái**: Hiển thị qua `StatusBadge`.
  4. **Số quyền**: Tổng số mã Permission mà tài khoản đó đang được hưởng thông qua Role.
  5. **Thao tác**: Nút Khóa (`LOCKED`) / Mở khóa (`ACTIVE`) tức thì.

### 3.3 Modal Tạo Tài Khoản Nhân Viên / Quản Lý Mới
- Nhập `Họ và tên`, `Email`, `Mật khẩu khởi tạo`, và chọn `Vai trò (Role)`.
- Sau khi tạo thành công, React Query tự động làm mới (`invalidateQueries(['users'])`) danh sách và thống kê.

