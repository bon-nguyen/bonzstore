# Đặc Tả API Danh Mục & Sản Phẩm Chuẩn TikTok Shop (`202405`) — Giai Đoạn Tiếp Theo

> **Tài liệu tham khảo**: [TikTok Shop Partner API — Get Authorized Category Assets (202405)](https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405)
> **Mục tiêu**: Thiết kế các API quản lý Danh mục (`Categories`) và Sản phẩm (`Products`) trên `apps/api` có cấu trúc JSON tương thích với TikTok Shop / Shopee Open API, phục vụ **Admin Dashboard** và công cụ **Đồng bộ / Copy sản phẩm từ Sàn về Web**.

---

## 1. API Danh Mục Ngành Hàng (`/api/categories`)

### 1.1 `GET /api/categories/assets` — Lấy Cây Danh Mục (Tương tự `GET /authorization/202405/category_assets`)
- **Permission yêu cầu**: `products.read`
- **Response chuẩn TikTok Shop `202405`**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": {
      "category_assets": [
        {
          "category": {
            "id": "600001",
            "parent_id": "0",
            "local_name": "Thời trang Nam",
            "is_leaf": false
          },
          "version": "v2",
          "permission_statuses": ["AVAILABLE"]
        },
        {
          "category": {
            "id": "600012",
            "parent_id": "600001",
            "local_name": "Áo thun Nam",
            "is_leaf": true
          },
          "version": "v2",
          "permission_statuses": ["AVAILABLE"]
        }
      ]
    }
  }
  ```

### 1.2 `POST /api/categories/sync-tiktok` — Đồng Bộ Cây Danh Mục Từ Sàn Về DB Nội Bộ
- **Permission yêu cầu**: `products.sync`
- **Chức năng**: Gọi API TikTok Shop `get-authorized-category-assets-202405`, lưu/cập nhật toàn bộ cây danh mục vào bảng `categories` trong PostgreSQL.

---

## 2. API Sản Phẩm & Đồng Bộ Sàn (`/api/products`)

| Method & Endpoint | Permission Yêu Cầu | Mô tả |
| :--- | :--- | :--- |
| `GET /api/products` | `products.read` | Lấy danh sách sản phẩm (SPU + tổng tồn kho SKU) hiển thị trên Dashboard |
| `GET /api/products/:id` | `products.read` | Chi tiết sản phẩm kèm toàn bộ biến thể `skus`, `salesAttributes`, `mainImages` |
| `POST /api/products` | `products.manage` | Tạo sản phẩm mới trực tiếp từ Dashboard |
| `PATCH /api/products/:id` | `products.manage` | Cập nhật thông tin sản phẩm, giá bán, tồn kho các biến thể SKU |
| `POST /api/products/import-from-platform` | `products.sync` | Copy / Đồng bộ sản phẩm từ TikTok Shop hoặc Shopee về bảng `products` & `product_skus` |

