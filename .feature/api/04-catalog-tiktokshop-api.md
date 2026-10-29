# Đặc Tả API Danh Mục, Sản Phẩm & Thẻ Chuẩn TikTok Shop (`202405`) — Đã Triển Khai

> **Tài liệu tham khảo**:
> - [TikTok Shop Partner API — Get Authorized Category Assets (202405)](https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405)
> - Mẫu giao diện TikTok Shop Seller Center: [`.feature/test.md`](file:///c:/Users/Admin/Desktop/bonzstore/.feature/test.md)

---

## 1. API Danh Mục Ngành Hàng (`/api/categories` — [`CategoriesController`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/categories/categories.controller.ts))

### 1.1 `GET /api/categories/assets` — Chuẩn `GET /authorization/202405/category_assets`
- **Permission yêu cầu**: `products.read`
- **Response chuẩn TikTok Shop `202405`**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "request_id": "1734097731620-a1b2c3d4",
    "data": {
      "category_assets": [
        {
          "id": "uuid",
          "cipher": "TTP_VN_CAT_ASSET_605015_202405",
          "target_market": "VN",
          "category": {
            "id": "605015",
            "parent_id": "605001",
            "local_name": "Nendoroid & Mô hình Chibi",
            "is_leaf": true
          },
          "version": "v2",
          "permission_statuses": ["AVAILABLE"]
        }
      ]
    }
  }
  ```

### 1.2 `GET /api/categories/paginated`, `GET /api/categories`, `POST /api/categories`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id`
- Tự động khởi tạo (`OnModuleInit`) cây danh mục Anime chuẩn TikTok Shop `202405` (19 danh mục thuộc 6 nhóm ngành hàng gốc) và tự động liên kết `parentId` giữa danh mục con với danh mục cha.
- `GET /api/categories/paginated`: Hỗ trợ phân trang (`page`, `limit`), tìm kiếm (`search`), lọc trạng thái (`status`) và sắp xếp (`sortBy`: `localName` | `productCount` | `status`, `sortOrder`: `asc` | `desc`) theo cấu trúc **Cha - Con liền kề** (danh mục con luôn nằm ngay dưới danh mục cha, không tách rời).
- `POST /api/categories`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id`: Bảo vệ bởi `@Roles('SUPER_ADMIN', 'STORE_MANAGER')` và `@RequirePermissions('products.manage')` — chỉ Admin và Manager mới có quyền thêm, sửa, xóa danh mục.

---

## 2. API Sản Phẩm & Thẻ Sản Phẩm (`/api/products` — [`ProductsController`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/products/products.controller.ts))

| Method & Endpoint | Permission Yêu Cầu | Mô tả |
| :--- | :--- | :--- |
| `GET /api/products/stats` | `products.read` | Thống kê số lượng theo 7 tab (`total`, `active`, `pending`, `failed`, `inactive`, `draft`, `deleted`), `outOfStock` (Hết hàng) và danh sách `tags` |
| `GET /api/products` | `products.read` | Danh sách sản phẩm phân trang, lọc theo `status` (7 tab), `search` (Tên SP, ID hoặc SKU), `categoryId`, `outOfStock`, `tag`, `sourcePlatform` & sắp xếp (`sortBy`, `sortOrder`) |
| `POST /api/products` | `products.manage` | Tạo sản phẩm mới gắn vào Danh mục lá (`isLeaf = true`) |
| `PATCH /api/products/:id` | `products.manage` | Cập nhật thông tin sản phẩm, danh mục lá, thương hiệu, thẻ & trạng thái |
| `PATCH /api/products/:id/status` | `products.manage` | Chuyển trạng thái sản phẩm theo 7 tab (`ACTIVE`, `PENDING`, `FAILED`, `INACTIVE`, `DRAFT`, `DELETED`) |
| `PATCH /api/products/:id/skus` | `products.manage` | Sửa nhanh **Hàng có sẵn (Tồn kho)** và **Giá bán lẻ / Giá khuyến mãi** của từng SKU ngay trên bảng |
| `POST /api/products/bulk-action` | `products.manage` | Thao tác hàng loạt trên nhiều sản phẩm đã chọn (`ACTIVATE`, `DEACTIVATE`, `DRAFT`, `DELETE`, `ADD_TAG`) |
| `GET /api/products/tags` | `products.read` | Lấy danh sách toàn bộ Thẻ sản phẩm kèm số lượng sản phẩm đang gắn |
| `POST /api/products/tags` | `products.manage` | Tạo thẻ mới hoặc gắn thẻ vào danh sách sản phẩm |
| `PATCH /api/products/tags/rename` | `products.manage` | Đổi tên thẻ đồng loạt trên toàn bộ sản phẩm |
| `POST /api/products/tags/delete` | `products.manage` | Gỡ và xóa thẻ khỏi toàn bộ sản phẩm |
| `POST /api/products/import-from-platform` | `products.sync` | Đồng bộ / Copy sản phẩm từ TikTok Shop hoặc Shopee về hệ thống |
