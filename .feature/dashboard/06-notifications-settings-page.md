# Chuông Thông Báo Admin & Trang Cài Đặt Thông Báo (`/settings/notifications`)

> **Các file Frontend chính**:
> - Chuông thông báo trên Header: [`NotificationBell.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/notifications/components/NotificationBell.tsx) (nhúng trong [`AppHeader.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/AppHeader.tsx))
> - Trang Cài đặt & Quản lý Thông báo: [`NotificationSettingsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/NotificationSettingsPage.tsx)
> - React Query Hooks: [`useNotifications.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/notifications/hooks/useNotifications.ts)
> - API Client & Types: [`notifications.api.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/api/endpoints/notifications.api.ts), [`notification.types.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/api/types/notification.types.ts)

---

## 1. Chuông Thông Báo Admin Trên Header ([`NotificationBell.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/notifications/components/NotificationBell.tsx))

Nằm tại góc phải [`AppHeader.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/layout/AppHeader.tsx) (cạnh nút chuyển đổi ngôn ngữ `VI/EN` và giao diện `Sáng/Tối`):

1. **Hiển thị Trạng thái Thời gian thực**:
   - Biểu tượng chuông `Bell` (hoặc `BellOff` khi tắt công tắc tổng `masterEnabled`).
   - Badge đỏ hiển thị số lượng thông báo chưa đọc (`unreadCount`, hỗ trợ `99+`).
   - Tự động cập nhật ngay lập tức (`invalidateQueries(['notifications'])`) mỗi khi Admin/Manager thực hiện thao tác **Thêm mới (`CREATE`)**, **Chỉnh sửa (`UPDATE`)** hoặc **Xóa (`DELETE`)** trên bất kỳ phân hệ nào.
2. **Popover Danh sách Thông báo Nhanh**:
   - **5 bộ lọc nhanh (Pills)**:
     - `Tất cả ({total})`
     - `Chưa đọc ({unreadCount})`
     - `Thêm mới ({byAction.CREATE})`
     - `Chỉnh sửa ({byAction.UPDATE})`
     - `Xóa ({byAction.DELETE})`
   - **Hiển thị từng thông báo song ngữ (`VI / EN`)**:
     - Badge màu theo tác vụ:
       - `CREATE` (Thêm mới): Xanh lá (`emerald`) + icon `PlusCircle`
       - `UPDATE` (Chỉnh sửa): Vàng cam (`amber`) + icon `Pencil`
       - `DELETE` (Xóa): Đỏ hồng (`rose`) + icon `Trash2`
     - Badge phân hệ (`Sản phẩm`, `Danh mục`, `Thẻ sản phẩm`, `Tài khoản & Nhân sự`, `Phân quyền RBAC`) và vai trò người thực hiện (`SUPER_ADMIN`, `STORE_MANAGER`).
     - Bấm vào thông báo sẽ tự động đánh dấu đã đọc (`PATCH /api/notifications/:id/read`) và điều hướng tới trang đích (`targetLink`: `/products`, `/categories`, `/tags`, `/users`, `/roles`).
   - **Thao tác nhanh**: Nút `Đọc tất cả` (`POST /api/notifications/read-all`), nút đánh dấu đọc/chưa đọc từng mục, nút xóa thông báo (dành cho `SUPER_ADMIN` & `STORE_MANAGER`), và nút mở trang **Cài đặt thông báo (`/settings/notifications`)**.

---

## 2. Trang Quản Lý & Cài Đặt Thông Báo (`/settings/notifications` — [`NotificationSettingsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/NotificationSettingsPage.tsx))

### 2.1 Thống Kê Nhanh Theo Tác Vụ (4 Stat Cards Tương Tác)
- **Tổng thông báo hệ thống (`total`)** kèm số lượng chưa đọc (`unreadCount`).
- **Thông báo Thêm mới (`CREATE`)**: Bấm vào card để lọc nhanh toàn bộ lịch sử tác vụ `CREATE`.
- **Thông báo Chỉnh sửa (`UPDATE`)**: Bấm vào card để lọc nhanh toàn bộ lịch sử tác vụ `UPDATE`.
- **Thông báo Xóa (`DELETE`)**: Bấm vào card để lọc nhanh toàn bộ lịch sử tác vụ `DELETE`.

### 2.2 Cấu Hình Nhận Thông Báo Tổng Quát & Công Cụ Test
- **3 Công tắc tổng (`Global Switches`)**:
  1. `Nhận thông báo hệ thống (Chuông Admin)` (`masterEnabled`): Tạm dừng hoặc kích hoạt toàn bộ việc ghi nhận thông báo mới.
  2. `Hiển thị Toast thông báo tức thời góc màn hình` (`showToastOnEvent`).
  3. `Chỉ nhận thông báo từ Admin & Quản lý (ADMIN_MANAGER_ROLES)` (`onlyAdminActions`).
- **Khung Gửi Thông Báo Test (`POST /api/notifications/test`)**:
  - Cho phép chọn Phân hệ (`PRODUCTS`, `CATEGORIES`, `TAGS`, `USERS`, `ROLES`) và Tác vụ (`CREATE`, `UPDATE`, `DELETE`) để phát thử thông báo lên Chuông Admin và kiểm tra quy tắc chặn khi tác vụ bị tắt.

### 2.3 Ma Trận Quản Lý Thông Báo Theo Tác Vụ: Thêm (`CREATE`) — Sửa (`UPDATE`) — Xóa (`DELETE`)
Bảng ma trận `5 Phân hệ × 3 Tác vụ` cho phép **Admin (`SUPER_ADMIN`)** và **Quản lý (`STORE_MANAGER`)** bật/tắt chi tiết từng sự kiện:

| Phân hệ (`Module`) | Tác vụ Thêm mới (`CREATE`) | Tác vụ Chỉnh sửa (`UPDATE`) | Tác vụ Xóa (`DELETE`) | Thao tác nhanh trên dòng |
| :--- | :---: | :---: | :---: | :---: |
| **Sản phẩm (`PRODUCTS`)** | `<Switch />` | `<Switch />` | `<Switch />` | `Bật cả 3` / `Tắt cả 3` |
| **Danh mục (`CATEGORIES`)** | `<Switch />` | `<Switch />` | `<Switch />` | `Bật cả 3` / `Tắt cả 3` |
| **Thẻ sản phẩm (`TAGS`)** | `<Switch />` | `<Switch />` | `<Switch />` | `Bật cả 3` / `Tắt cả 3` |
| **Tài khoản & Nhân sự (`USERS`)** | `<Switch />` | `<Switch />` | `<Switch />` | `Bật cả 3` / `Tắt cả 3` |
| **Phân quyền RBAC (`ROLES`)** | `<Switch />` | `<Switch />` | `<Switch />` | `Bật cả 3` / `Tắt cả 3` |

- Hỗ trợ 3 nút bật/tắt nhanh theo cột: **Bật/Tắt tất cả Thêm (`CREATE`)**, **Bật/Tắt tất cả Sửa (`UPDATE`)**, **Bật/Tắt tất cả Xóa (`DELETE`)** và nút **Khôi phục mặc định (`POST /api/notifications/settings/reset`)**.
- Với tài khoản `STAFF`, các công tắc ở chế độ chỉ xem kèm biểu tượng khóa `Chỉ Admin & Manager`.

### 2.4 Bảng Lịch Sử Thông Báo Hệ Thống
- **Tìm kiếm có Debounce (`400ms`)**: Tìm theo tiêu đề, nội dung thông báo (`VI/EN`), tên đối tượng (`targetName`) hoặc người thực hiện (`actorName`, `actorEmail`).
- **Bộ lọc đồng bộ URL (`useSearchParams`)**: Lọc theo Phân hệ (`module`), Tác vụ (`action`: `CREATE` | `UPDATE` | `DELETE`) và Trạng thái đọc (`readStatus`: `UNREAD` | `READ`).
- **Sắp xếp (`Sort`)**: Hỗ trợ sắp xếp theo cột **Phân hệ (`module`)**, **Tác vụ (`action`)** và **Thời gian (`createdAt`)**.
- **Phân trang chuẩn [`Pagination`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/components/ui/pagination.tsx)**: Đồng bộ hoàn toàn với trang `/products` (`Tổng số hàng: N | < 1 > | 10/Trang`, `20/Trang`, `50/Trang`).

