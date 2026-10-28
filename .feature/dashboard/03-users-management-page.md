# Trang Quản Lý Người Dùng (Admin, Nhân Viên, Khách Hàng) — `UsersPage` (`/users`)

> **Route**: `/users` (`http://localhost:5173/users`)
> **Quyền truy cập trang (`ProtectedRoute`)**: `users.read`
> **Files liên quan**:
> - Page: [`apps/dashboard/src/pages/UsersPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/UsersPage.tsx)
> - Feature Dialogs (`src/features/users/components/`):
>   - [`CreateUserDialog.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/components/CreateUserDialog.tsx) (Tạo tài khoản mới)
>   - [`UserDetailDialog.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/components/UserDetailDialog.tsx) (Xem chi tiết hồ sơ, phiên đăng nhập & danh sách quyền)
>   - [`EditUserDialog.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/components/EditUserDialog.tsx) (Chỉnh sửa thông tin, SĐT, Role, Trạng thái)
>   - [`ResetPasswordDialog.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/components/ResetPasswordDialog.tsx) (Đặt lại mật khẩu, tạo mật khẩu ngẫu nhiên & thu hồi phiên cũ)
> - Shared Table & Pagination: [`ResponsiveTable.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/shared/ResponsiveTable.tsx), [`pagination.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/ui/pagination.tsx)
> - Debounce & Lodash Utils: [`useDebouncedValue.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/hooks/useDebouncedValue.ts), [`utils.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/lib/utils.ts)
> - Hooks: [`useUsers()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/hooks/useUsers.ts), [`useUserDetail()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/hooks/useUsers.ts), [`useCreateUser()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/hooks/useUsers.ts), [`useUpdateUser()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/hooks/useUsers.ts), [`useResetUserPassword()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/hooks/useUsers.ts)
> - API Endpoints tương ứng: `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `PATCH /api/users/:id`, `PATCH /api/users/:id/reset-password` (Xem [`.feature/api/02-users-api.md`](../api/02-users-api.md))

---

## 1. Mục Đích & Phân Cấp Bậc Thẩm Quyền (Role Hierarchy)

Trang `/users` quản lý tập trung cả **4 nhóm vai trò** theo thứ bậc thẩm quyền nghiêm ngặt:

| Thứ bậc (Rank) | Mã Vai Trò (`role.code`) | Quyền hạn trên trang `/users` |
| :-: | :--- | :--- |
| **100 (Cao nhất)** | **`SUPER_ADMIN`** | **Toàn quyền thao tác**: Xem đầy đủ email/SĐT của mọi tài khoản, tạo/sửa/khóa/reset password bất kỳ tài khoản nào và được phép gán quyền `SUPER_ADMIN`. |
| **50** | **`STORE_MANAGER`** | **Quản lý cấp dưới (`STAFF`, `CUSTOMER`)**:<br>- Các tài khoản cấp cao hơn (`SUPER_ADMIN` như `admin@bonzstore.com`) sẽ **bị mã hóa/hash email** (`ad***#a1b2@bonzstore.com`) kèm nhãn `Hashed`.<br>- **Chặn hoàn toàn ở cả FE & BE (`403 Forbidden`)** không cho sửa thông tin, khóa, reset mật khẩu tài khoản `SUPER_ADMIN` hoặc nâng quyền bất kỳ ai lên `SUPER_ADMIN`. |
| **20** | **`STAFF`** | Bị chặn vào trang `/users` theo mặc định (nếu được cấp `users.read` thì chỉ được xem và bị ẩn email của các cấp cao hơn). |
| **10** | **`CUSTOMER`** | Chặn hoàn toàn khỏi cổng Admin Dashboard (`403 Forbidden`). |

---

## 2. Ma Trận Phân Quyền Truy Cập & Thao Tác Trên Trang `/users`

| Thao tác trên giao diện | Mã Quyền Yêu Cầu | Điều kiện Cấp Bậc (Hierarchy) | Hành vi khi KHÔNG đủ quyền / cấp bậc |
| :--- | :--- | :--- | :--- |
| **Vào trang `/users` & xem bảng** | `users.read` | `isAdminPanel = true` | Ẩn menu trên Sidebar; truy cập URL trực tiếp sẽ chuyển hướng sang `/forbidden` (`403`) |
| **Xem chi tiết (`UserDetailDialog`)** | `users.read` | Mọi cấp trong Dashboard | Hiển thị Modal chi tiết; nếu xem cấp cao hơn (`SUPER_ADMIN`) thì email/SĐT vẫn bị hash và ẩn nút Sửa/Reset Password |
| **Bấm nút `+ Thêm Nhân viên / Quản lý`** | `users.create` | `SUPER_ADMIN` hoặc `STORE_MANAGER` | Nếu là `STORE_MANAGER`, dropdown chọn Role trong Modal tự động **loại bỏ `SUPER_ADMIN`** |
| **Sửa thông tin (`EditUserDialog`)** | `users.update` | `canActorManageRole(actor, target)` | Ẩn nút `Pencil` trên dòng `SUPER_ADMIN` khi đăng nhập bằng `STORE_MANAGER`; chặn `403` ở Backend |
| **Reset Password (`ResetPasswordDialog`)** | `users.update` | `canActorManageRole(actor, target)` | Ẩn nút `KeyRound` trên dòng `SUPER_ADMIN` khi đăng nhập bằng `STORE_MANAGER`; chặn `403` ở Backend |
| **Đổi Vai trò / Khóa tài khoản** | `users.update` | `canActorManageRole(actor, target)` | Với dòng `SUPER_ADMIN`, ẩn `<Select>` và thay nút Khóa bằng nhãn `🔒 Chỉ SUPER_ADMIN` |

---

## 3. Các Tính Năng Chi Tiết Trên Trang `/users`

### 3.1 Kiểm Tra Dữ Liệu Với `lodash` & Tìm Kiếm Có Debounce (`400ms`)
- Sử dụng thư viện **`lodash`** (`debounce`, `isEmpty`, `isNil`, `omitBy`, `trim`) để kiểm tra dữ liệu đầu vào (`checkdata`) và loại bỏ các tham số rỗng.
- Khi người dùng gõ vào ô tìm kiếm (`searchInput`), hook [`useDebouncedValue(searchInput, 400)`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/hooks/useDebouncedValue.ts) sẽ đợi `400ms` sau lần gõ cuối cùng mới bắn request `GET /api/users?search=...` và tự động đưa phân trang về `page=1`.

### 3.2 Trạng Thái Loading Trực Quan Khi Search / Filter / Sort
- Khi đang gõ tìm kiếm hoặc khi API `GET /api/users?search=...` đang chạy (`isLoading || isFetching`), bảng [`ResponsiveTable`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/shared/ResponsiveTable.tsx) hiển thị spinner loading ngay trong phần thân bảng (`Đang tải dữ liệu...`) đồng thời hiện icon `Loader2` xoay bên phải ô tìm kiếm.

### 3.3 Đồng Bộ Toàn Bộ Bộ Lọc & Phân Trang Lên URL (`http://localhost:5173/users`)
- Mọi thao tác tìm kiếm, chọn Tab vai trò, lọc trạng thái, sắp xếp cột và chuyển trang đều cập nhật trực tiếp lên thanh địa chỉ trình duyệt thông qua `useSearchParams`.

### 3.4 Sắp Xếp Mặc Định Theo Vai Trò (`role`) & Sort Trực Tiếp Trên Cột Table
- **Mặc định**: API và bảng tự động sắp xếp theo **Vai trò (`sortBy=role`, `sortOrder=asc`)**.
- **Sort trên Header cột**: Bấm trực tiếp vào tiêu đề các cột **Vai trò (`role`)**, **Trạng thái (`status`)**, **Tài khoản (`fullName`)** để đảo chiều sắp xếp (`asc` ↔ `desc`).

### 3.5 Phân Trang Tối Đa 20 Bản Ghi / Lần (`limit = 20`)
- Giới hạn tối đa mỗi lần tải là **20 người dùng / trang** (`MAX_USERS_PER_PAGE = 20`).

### 3.6 Bộ 4 Modal Thao Tác Người Dùng
1. **Modal Xem Chi Tiết ([`UserDetailDialog`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/components/UserDetailDialog.tsx))**:
   - Mở khi bấm vào tên tài khoản hoặc nút icon Con mắt (`Eye`).
   - Hiển thị đầy đủ: Avatar viết tắt, UUID, Email, Số điện thoại, Vai trò RBAC, Quyền vào cổng Dashboard, Số phiên đăng nhập đang hoạt động (`activeSessions`), Ngày tạo (`createdAt`), Lần đăng nhập cuối (`lastLoginAt`), và toàn bộ danh sách mã quyền (`permissions`).
   - Tích hợp nút chuyển nhanh sang **Chỉnh sửa** hoặc **Reset Password** ngay trong footer của Modal.
2. **Modal Chỉnh Sửa Tài Khoản ([`EditUserDialog`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/components/EditUserDialog.tsx))**:
   - Mở khi bấm nút icon Bút chì (`Pencil`).
   - Cho phép cập nhật `Họ và tên`, `Số điện thoại`, `Vai trò (Role)` và `Trạng thái (ACTIVE / LOCKED / INACTIVE)`.
3. **Modal Reset Password ([`ResetPasswordDialog`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/components/ResetPasswordDialog.tsx))**:
   - Mở khi bấm nút icon Chìa khóa (`KeyRound`).
   - Hỗ trợ tự động sinh mật khẩu ngẫu nhiên (`Bonz@xxxx`), nút ẩn/hiện mật khẩu, nút Copy vào Clipboard và tự động thu hồi toàn bộ phiên đăng nhập cũ của user đó sau khi reset.
4. **Modal Tạo Tài Khoản Mới ([`CreateUserDialog`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/users/components/CreateUserDialog.tsx))**:
   - Mở khi bấm nút `+ Thêm Nhân viên / Quản lý`.
