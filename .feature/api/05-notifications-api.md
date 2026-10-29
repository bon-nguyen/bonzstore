# Đặc Tả API Thông Báo Admin & Cấu Hình Sự Kiện Thêm / Sửa / Xóa (`/api/notifications`)

> **Các file Backend chính**:
> - Module toàn cục (`@Global()`): [`notifications.module.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/notifications/notifications.module.ts)
> - Controller: [`notifications.controller.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/notifications/notifications.controller.ts)
> - Service & Tự động ghi nhận sự kiện CRUD: [`notifications.service.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/notifications/notifications.service.ts)
> - DTOs: [`notification.dto.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/notifications/dto/notification.dto.ts)

---

## 1. Danh Sách Endpoints (`/api/notifications`)

| Method & Endpoint | Roles & Permission Yêu Cầu | Mô tả |
| :--- | :--- | :--- |
| `GET /api/notifications` | `dashboard.view` | Lấy danh sách thông báo có phân trang (`page`, `limit`), tìm kiếm (`search`), lọc theo `module`, `action` (`CREATE`, `UPDATE`, `DELETE`), `readStatus` (`ALL`, `UNREAD`, `READ`), sắp xếp (`sortBy`, `sortOrder`) kèm thống kê `stats` |
| `GET /api/notifications/stats` | `dashboard.view` | Lấy thống kê tổng số thông báo (`total`, `unreadCount`, `readCount`, `byAction`, `byModule`) |
| `GET /api/notifications/settings` | `dashboard.view` | Lấy cấu hình cài đặt thông báo hiện tại (`masterEnabled`, `showToastOnEvent`, `onlyAdminActions`, ma trận `modules[module][action]`) |
| `PATCH /api/notifications/settings` | `SUPER_ADMIN`, `STORE_MANAGER` + `dashboard.view` | Cập nhật công tắc tổng hoặc bật/tắt thông báo theo từng tác vụ `CREATE` / `UPDATE` / `DELETE` của từng phân hệ |
| `POST /api/notifications/settings/reset` | `SUPER_ADMIN`, `STORE_MANAGER` + `dashboard.view` | Khôi phục toàn bộ cài đặt thông báo về mặc định |
| `POST /api/notifications/test` | `SUPER_ADMIN`, `STORE_MANAGER` + `dashboard.view` | Phát thông báo kiểm thử cho một `(module, action)` (tự động kiểm tra và báo lỗi nếu tác vụ đó đang bị tắt trong cài đặt) |
| `PATCH /api/notifications/:id/read` | `dashboard.view` | Đánh dấu 1 thông báo là đã đọc hoặc chưa đọc (`isRead: boolean`) |
| `POST /api/notifications/read-all` | `dashboard.view` | Đánh dấu toàn bộ thông báo là đã đọc |
| `DELETE /api/notifications/clear-read` | `SUPER_ADMIN`, `STORE_MANAGER` + `dashboard.view` | Xóa toàn bộ các thông báo đã đọc |
| `DELETE /api/notifications/:id` | `SUPER_ADMIN`, `STORE_MANAGER` + `dashboard.view` | Xóa 1 thông báo theo ID |

---

## 2. Cơ Chế Tự Động Ghi Nhận Thông Báo Khi Thực Hiện Thêm / Sửa / Xóa (`recordCrudEvent`)

[`NotificationsModule`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/notifications/notifications.module.ts) được đăng ký `@Global()` trong [`AppModule`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/app.module.ts) và được inject trực tiếp vào 4 Service nghiệp vụ:

1. **[`ProductsService`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/products/products.service.ts)**:
   - `create` → Ghi nhận sự kiện `PRODUCTS` + `CREATE`
   - `update`, `updateStatus` → Ghi nhận sự kiện `PRODUCTS` + `UPDATE` (hoặc `DELETE` khi chuyển sang trạng thái `DELETED`)
   - `createOrAttachTag` → Ghi nhận sự kiện `TAGS` + `CREATE`
   - `renameTag` → Ghi nhận sự kiện `TAGS` + `UPDATE`
   - `deleteTag` → Ghi nhận sự kiện `TAGS` + `DELETE`
2. **[`CategoriesService`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/categories/categories.service.ts)**:
   - `create` → Ghi nhận sự kiện `CATEGORIES` + `CREATE`
   - `update` → Ghi nhận sự kiện `CATEGORIES` + `UPDATE`
   - `remove` → Ghi nhận sự kiện `CATEGORIES` + `DELETE`
3. **[`UsersService`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/users/users.service.ts)**:
   - `create` → Ghi nhận sự kiện `USERS` + `CREATE`
   - `update`, `resetPassword` → Ghi nhận sự kiện `USERS` + `UPDATE`
4. **[`RolesService`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/roles/roles.service.ts)**:
   - `create` → Ghi nhận sự kiện `ROLES` + `CREATE`
   - `update` → Ghi nhận sự kiện `ROLES` + `UPDATE`

Trước khi lưu thông báo mới, hàm [`NotificationsService.shouldRecord(module, action, actorRole)`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/notifications/notifications.service.ts#L334-L351) tự động kiểm tra:
- Công tắc tổng `masterEnabled` có đang bật hay không.
- Nếu `onlyAdminActions = true`, người thực hiện có thuộc `ADMIN_MANAGER_ROLES` (`SUPER_ADMIN`, `STORE_MANAGER`) hay không.
- Công tắc `settings.modules[module][action]` (`CREATE` / `UPDATE` / `DELETE`) có đang bật hay không.

