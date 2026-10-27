# Trang Quản Lý Danh Mục & Sản Phẩm (Chuẩn TikTok Shop `202405`) — Đặc Tả Giai Đoạn Tiếp Theo

> **Routes dự kiến trên Dashboard**:
> - `/categories`: Quản lý Cây Danh mục ngành hàng (Category Assets)
> - `/products`: Quản lý Sản phẩm (SPU & SKU) và Đồng bộ từ Sàn (TikTok Shop / Shopee)
> **Tài liệu tham khảo gốc**: [TikTok Shop Partner API — Get Authorized Category Assets (202405)](https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405)

---

## 1. Mục Đích Nghiệp Vụ

Xây dựng hệ thống quản lý Danh mục & Sản phẩm trên **Admin Dashboard** có cấu trúc dữ liệu tương thích hoàn toàn với **TikTok Shop / Shopee**, phục vụ 2 nhu cầu:
1. **Quản lý nội bộ**: Admin và Nhân viên thêm/sửa sản phẩm, biến thể (SKU), giá bán, tồn kho để hiển thị lên trang bán hàng Next.js (`apps/web`).
2. **Đồng bộ & Copy sản phẩm từ Sàn về Web**: Lấy cây danh mục đã cấp phép (`Authorized Category Assets`) và kéo/copy toàn bộ thông tin sản phẩm (tiêu đề, mô tả HTML, bộ ảnh, phân loại Màu/Size, giá, tồn kho) từ gian hàng TikTok Shop hoặc Shopee về BonzStore chỉ bằng 1 cú nhấp chuột.

---

## 2. Phân Quyền Truy Cập Trang & Thao Tác (RBAC cho Sản Phẩm)

| Mã Quyền (Permission Code) | Loại | Ý nghĩa trên Dashboard |
| :--- | :---: | :--- |
| `products.read` | **Page + Action** | Hiển thị menu **Sản phẩm & Danh mục** trên Sidebar; vào xem danh sách sản phẩm, tồn kho, cây danh mục |
| `products.manage` | **Action** | Hiển thị nút **+ Tạo sản phẩm**, **Sửa giá/tồn kho**, **Ẩn/Hiện sản phẩm**, **Quản lý danh mục** |
| `products.sync` | **Action** | Hiển thị nút **Đồng bộ từ TikTok Shop / Shopee** và **Copy sản phẩm từ Sàn về Web** |

---

## 3. Tính Năng Chi Tiết Trên Trang Danh Mục (`/categories`)

Thiết kế theo chuẩn `get-authorized-category-assets-202405`:
1. **Hiển thị Cây Danh Mục Đa Cấp (`Tree View` / `Cascader`)**:
   - Cấp 1 (`parent_id = "0"`) → Cấp 2 → Cấp 3 (Danh mục lá `is_leaf = true`).
   - Hiển thị rõ badge **`Leaf Category`** (chỉ danh mục lá mới được gắn sản phẩm).
2. **Trạng thái cấp phép ngành hàng (`permission_statuses`)**:
   - `AVAILABLE`: Đủ điều kiện đăng bán.
   - `INVITE_ONLY`: Ngành hàng hạn chế / cần xét duyệt.
   - `NON_MAIN_CATEGORY`: Ngành hàng ngoài danh mục chính.
3. **Nút Đồng Bộ Cây Danh Mục Từ Sàn**:
   - Gọi API đồng bộ danh sách Category từ TikTok Shop (`version = v2`) về bảng `categories` nội bộ.

---

## 4. Tính Năng Chi Tiết Trên Trang Sản Phẩm (`/products`)

1. **Bộ lọc đa chiều (`.filter-panel`)**:
   - Lọc theo trạng thái: `ACTIVE` (Đang bán), `DRAFT` (Nháp), `INACTIVE` (Đã ẩn), `FREEZE` (Khóa).
   - Lọc theo nguồn sản phẩm (`sourcePlatform`): `Tất cả`, `Tạo tại Web (LOCAL)`, `TikTok Shop`, `Shopee`.
   - Lọc theo danh mục (`categoryId`).
2. **Bảng Danh Sách Sản Phẩm (`ResponsiveTable`)**:
   - Ảnh đại diện + Tên sản phẩm + Mã SPU (`externalProductId` nếu đồng bộ từ sàn).
   - Danh mục ngành hàng (`localName`).
   - Danh sách biến thể SKU (Màu sắc / Kích cỡ) + Khoảng giá (`salePrice`) + Tổng tồn kho (`stockQuantity`).
   - Nhãn nguồn gốc: Badge `TikTok Shop`, `Shopee`, hoặc `BonzStore`.
   - Thời gian đồng bộ gần nhất (`lastSyncedAt`).
3. **Tính năng Copy / Đồng Bộ Sản Phẩm Từ Sàn Về Web**:
   - **Cách 1 (Đồng bộ qua API Shop đã liên kết)**: Chọn gian hàng TikTok Shop/Shopee → Bấm **Kéo danh sách sản phẩm về Web**.
   - **Cách 2 (Copy nhanh sản phẩm)**: Chọn các sản phẩm từ sàn trong modal Preview → Chỉnh sửa lại giá bán trên Web (nếu muốn) → Bấm **Lưu & Đăng lên Web**.

