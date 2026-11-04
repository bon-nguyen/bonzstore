# API Quản Lý Nhập Hàng (`#55479`), Sổ Quỹ Thu/Chi & Biểu Đồ Phân Tích (`apps/api`)

> **Modules liên quan**:
> - **Module Nhập hàng (`ImportsModule`)**: [`apps/api/src/modules/imports/`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/imports/imports.service.ts)
> - **Module Sổ quỹ & Biểu đồ (`CashbookModule`)**: [`apps/api/src/modules/cashbook/`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/cashbook/cashbook.service.ts)
> - **Dữ liệu gốc chuẩn Đơn `#55479`**: [`hoabinh-order-55479.data.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/imports/data/hoabinh-order-55479.data.ts)

---

## 1. Cơ Chế Lưu Trữ Tương Thích Production & Auto-Restore Khi Gọi API

1. **Tương thích 100% với PostgreSQL Production hiện tại**:
   - Sử dụng bảng JSONB `app_kv_store` được khởi tạo tự động (`CREATE TABLE IF NOT EXISTS "app_kv_store"`) kết hợp bộ nhớ đệm, không làm thay đổi hay xung đột với schema `products` / `product_skus` / `users` đang chạy trên Production.
   - Khi đồng bộ sản phẩm từ đơn nhập `#55479`, dữ liệu được ghi trực tiếp vào bảng `products` và `product_skus` hiện hữu để hiển thị ngay trên trang `/products`.
2. **Auto-Restore Data khi gọi API (`ensureRestoredOnApiCall`)**:
   - Mọi hàm xử lý API trong `ImportsService` và `CashbookService` đều tự động kiểm tra và khôi phục dữ liệu đơn `#55479` cùng các phiếu Sổ Quỹ nếu dữ liệu bị trống hoặc khi gọi API tới `https://hoabinhlogistics.com/api/main-order/55479` mà không có kết nối mạng ngoài.

---

## 2. Danh Sách Endpoints — Nhập Hàng (`/api/imports` & `/api/main-order`)

| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/main-order/:id` | `@Public()` | Trả về đúng cấu trúc JSON `{ Success: true, Data: {...}, ResultCode: 200, ResultMessage: null }` của `https://hoabinhlogistics.com/api/main-order/55479` (Kèm Auto-Restore) |
| `GET` | `/api/imports` | `dashboard.view` | Danh sách đơn nhập hàng có phân trang, tìm kiếm mã đơn / mã vận đơn / sản phẩm 1688 |
| `GET` | `/api/imports/stats` | `dashboard.view` | Thống kê tổng giá trị nhập (VNĐ/CNY), tổng cân nặng, số kiện và trạng thái Token |
| `GET` | `/api/imports/token` | `dashboard.view` | Lấy thông tin cấu hình Bearer Token Hoà Bình Logistics |
| `POST` | `/api/imports/token` | `ADMIN_MANAGER_ROLES` | Lưu Bearer Token mới sau khi đăng nhập tab Hoà Bình Logistics |
| `POST` | `/api/imports/fetch-order` | `ADMIN_MANAGER_ROLES` | Lấy chi tiết đơn từ `https://hoabinhlogistics.com/api/main-order/:id` (hoặc Auto-Restore snapshot `#55479`), tự động đồng bộ vào Kho Sản Phẩm & Sổ Quỹ |
| `POST` | `/api/imports/:id/sync-catalog` | `ADMIN_MANAGER_ROLES` | Đồng bộ lại các mặt hàng 1688 trong đơn nhập sang trang `/products` và `/cashbook` |
| `POST` | `/api/imports/restore` | `ADMIN_MANAGER_ROLES` | Khôi phục toàn bộ dữ liệu gốc đơn `#55479`, Kho Sản Phẩm và Sổ Quỹ |

---

## 3. Danh Sách Endpoints — Sổ Quỹ & Biểu Đồ (`/api/cashbook`)

| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/cashbook` | `dashboard.view` | Danh sách phiếu Thu/Chi có phân trang, tìm kiếm và lọc theo Loại phiếu / Kênh thanh toán / Phân loại |
| `GET` | `/api/cashbook/summary` | `dashboard.view` | Tính toán `Đầu kỳ`, `Tổng thu (+TM, +Thẻ, +CK)`, `Tổng chi (+TM, +Thẻ, +CK)`, `Cuối kỳ = Đầu kỳ + Tổng thu - Tổng chi` |
| `GET` | `/api/cashbook/charts` | `dashboard.view` | Dữ liệu tổng hợp cho Trang Biểu Đồ (`/charts`): Xu hướng theo ngày, Cơ cấu kênh thanh toán, Phân tích chi phí & cân nặng đơn `#55479` |
| `POST` | `/api/cashbook` | `ADMIN_MANAGER_ROLES` | Lập Phiếu Thu (`INCOME`) hoặc Lập Phiếu Chi (`EXPENSE`) |
| `PATCH` | `/api/cashbook/opening-balance` | `ADMIN_MANAGER_ROLES` | Cập nhật Số dư Đầu kỳ theo `Tiền mặt`, `Thẻ`, `Chuyển khoản` |
| `PATCH` | `/api/cashbook/:id` | `ADMIN_MANAGER_ROLES` | Chỉnh sửa phiếu Thu/Chi |
| `DELETE` | `/api/cashbook/:id` | `ADMIN_MANAGER_ROLES` | Xóa phiếu Thu/Chi |
| `POST` | `/api/cashbook/restore` | `ADMIN_MANAGER_ROLES` | Khôi phục dữ liệu mẫu Sổ Quỹ và các phiếu thanh toán của đơn `#55479` |

