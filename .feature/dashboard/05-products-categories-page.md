# Phân Hệ Sản Phẩm Chuẩn TikTok Shop Seller Center (`202405`) — Đã Triển Khai

> **Cấu trúc 3 trang con trong Phân hệ Sản phẩm (`CatalogSubNav` & `AppSidebar`)**:
> 1. **1. Tất cả sản phẩm (`/products`)**: Quản lý Sản phẩm theo đúng giao diện & luồng thao tác **TikTok Shop Seller Center** (`.feature/test.md`).
> 2. **2. Danh mục (`/categories`)**: Quản lý Cây Danh mục ngành hàng chuẩn `get-authorized-category-assets-202405`.
> 3. **3. Thẻ (`/tags`)**: Quản lý Thẻ sản phẩm (`Product Tags`), đổi tên hàng loạt và lọc sản phẩm theo chiến dịch.
>
> **Tài liệu tham khảo gốc**:
> - [TikTok Shop Partner API — Get Authorized Category Assets (202405)](https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405)
> - Mẫu giao diện TikTok Shop Seller Center: [`.feature/test.md`](file:///c:/Users/Admin/Desktop/bonzstore/.feature/test.md)

---

## 1. Trang 1: Tất Cả Sản Phẩm (`/products` — [`ProductsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ProductsPage.tsx))

Thiết kế đồng bộ 100% với **TikTok Shop Seller Center** để dễ dàng quản lý và đồng bộ dữ liệu:

### 1.1 Hệ Thống 7 Tabs Trạng Thái Sản Phẩm (Kèm Bộ Đếm Thời Gian Thực)
1. **Tất cả (`ALL`)**: Tổng số sản phẩm đang quản lý (không bao gồm sản phẩm đã xóa).
2. **Trên kệ (`ACTIVE`)**: Sản phẩm đang mở bán công khai (VD: `Trên kệ 132`).
3. **Đang xem xét (`PENDING`)**: Sản phẩm đang chờ duyệt chất lượng / đồng bộ sàn (`Đang xem xét 0`).
4. **Cần chú ý (`FAILED` / `FREEZE`)**: Sản phẩm bị khóa hoặc cần bổ sung thông tin theo chính sách TikTok Shop (`Cần chú ý 0`).
5. **Đã vô hiệu hóa (`INACTIVE`)**: Sản phẩm đã tạm ẩn / ngừng bán.
6. **Bản nháp (`DRAFT`)**: Sản phẩm đang soạn thảo chưa đăng kệ.
7. **Đã xóa (`DELETED`)**: Sản phẩm đã chuyển vào thùng rác.

### 1.2 Thanh Tìm Kiếm & Bộ Lọc Đồng Bộ URL (`useSearchParams`)
- **Ô tìm kiếm (`lodash/debounce` 400ms)**:
  - Placeholder: `"Tên sản phẩm, ID hoặc SKU"` (tìm đồng thời theo `title`, `id`, `externalProductId`, `sellerSku`, `externalSkuId` và `brandName`).
  - Nút xóa nhanh từ khóa (`X`).
- **Bộ lọc `Hạng mục` (`categoryId`)**: Lọc theo bất kỳ danh mục cha hoặc danh mục lá (`202405`).
- **Nút bật/tắt nhanh `Hết hàng <count>` (`outOfStock=true`)**: Lọc ngay các sản phẩm có tổng tồn kho bằng `0` hoặc có biến thể SKU bị hết hàng.
- **Bộ lọc `Thẻ (Tags)` (`tag`)**: Lọc sản phẩm theo nhãn chiến dịch (`Hunter x Hunter`, `Chibi Q-Ver`, `Best Seller`, ...).
- **Menu `Sắp xếp theo` (`sortBy:sortOrder`)**:
  - Cập nhật mới nhất (`updatedAt:desc`)
  - Giá bán lẻ: Thấp → Cao / Cao → Thấp (`price:asc`, `price:desc`)
  - Hàng có sẵn: Thấp → Cao / Cao → Thấp (`stock:asc`, `stock:desc`)
  - Hiệu suất bán chạy nhất (`soldCount:desc`)

### 1.3 Cấu Trúc Bảng Sản Phẩm Chuẩn TikTok Shop (`.feature/test.md`)
- **Checkbox chọn hàng loạt**: Hỗ trợ thao tác hàng loạt (`Đưa lên kệ`, `Vô hiệu hóa`, `Chuyển Bản nháp`, `Gắn thẻ nhanh`, `Xóa sản phẩm`).
- **Cột 1 — `Sản phẩm`**:
  - Ảnh vuông `48x48` có hiệu ứng hover hiển thị icon con mắt (`Eye`) xem trước/chỉnh sửa.
  - Tiêu đề sản phẩm tối đa 2 dòng (`line-clamp-2`) kèm icon `Eye` khi di chuột.
  - Mã định danh `ID: 1734097731620276111` kèm nút **Copy ID** (`Copy` icon).
  - Hàng hiển thị Badge Danh mục & các Thẻ (`Tags`).
- **Cột 2 — `Hiệu suất` (Có sắp xếp & Tooltip)**:
  - `{soldCount} món bán ra` (VD: `3 món bán ra`)
  - `Lượt xem: {viewCount}` (VD: `Lượt xem: 4.852`)
  - `Doanh số: {revenue}₫` (VD: `Doanh số: 115.650₫`)
- **Cột 3 — `Trạng thái` (Có sắp xếp)**:
  - Chấm tròn màu sắc (`#2D9F4B` xanh lá cho `Trên kệ`, vàng cho `Đang xem xét`, đỏ cho `Cần chú ý`, xám cho `Đã vô hiệu hóa`) + Tên trạng thái.
  - Dòng phụ hiển thị thời gian cập nhật (VD: `19:30 thứ Tư`).
- **Cột 4 — `Hàng có sẵn` (Có sắp xếp + Sửa nhanh bằng icon Cây bút)**:
  - Hiển thị tổng tồn kho (VD: `31`) + nút icon **Cây bút (`Pencil`)** mở ngay modal [`QuickEditStockDialog.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/catalog/components/QuickEditStockDialog.tsx) để sửa số lượng tồn kho cho từng SKU hoặc áp dụng hàng loạt.
- **Cột 5 — `Giá bán lẻ` (Có sắp xếp + Sửa nhanh bằng icon Cây bút)**:
  - Hiển thị khoảng giá bán lẻ gốc giữa các SKU (VD: `69.000₫ - 299.000₫`) + nút icon **Cây bút (`Pencil`)** mở modal [`QuickEditPriceDialog.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/catalog/components/QuickEditPriceDialog.tsx).
  - Dòng phụ hiển thị khoảng giá khuyến mãi: `Khuyến mãi: 51.750₫ - 224.250₫`.
- **Cột 6 — `Hành động`**:
  - Nút vuông **Sửa (`Pencil`)** mở [`EditProductDialog.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/catalog/components/EditProductDialog.tsx).
  - Nút vuông **Thêm (`...`)** mở menu chuyển nhanh trạng thái hoặc sửa nhanh SKU.
- **Dòng phụ Mở Rộng SKU (`{skuCount} SKU | Mở rộng ⌄`)**:
  - Nằm ngay bên dưới mỗi sản phẩm (giống hệt `tr.core-table-expand-content` trong `.feature/test.md`).
  - Khi bấm `Mở rộng`, bảng chi tiết toàn bộ `12 SKU` (phân loại nhân vật, `sellerSku`, `externalSkuId`, `Hàng có sẵn`, `Giá bán lẻ`, `Khuyến mãi`) hiển thị trực tiếp ngay bên dưới sản phẩm.

---

## 2. Trang 2: Danh Mục (`/categories` — [`CategoriesPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/CategoriesPage.tsx))

- **Cấu trúc Cha - Con liền kề**: Danh mục con (`↳ Light Novel & Boxset Manga Đặc biệt`, `parent_id: 607001`) luôn nằm ngay bên dưới thành phần cha (`Manga, Light Novel & Artbook`, `parent_id: 0`), không bao giờ bị tách rời khi sắp xếp, tìm kiếm hay phân trang.
- **Đa ngôn ngữ (`i18n` VI / EN)**: Toàn bộ tiêu đề cột (`category.local_name`, `category.id / parent_id`, `category.is_leaf`, `permission_statuses`, `Sản phẩm`, `Trạng thái`, `Thao tác`) và nhãn hiển thị trong bảng được dịch đầy đủ sang Tiếng Việt và Tiếng Anh.
- **Tìm kiếm có Debounce (`400ms`) & Bộ lọc trạng thái**: Tìm kiếm tức thì theo `local_name`, `id`, `parent_id`, `cipher` và lọc theo trạng thái (`ACTIVE` / `INACTIVE`) đồng bộ với URL (`useSearchParams`).
- **Sắp xếp (`Sort`)**: Hỗ trợ sắp xếp tăng/giảm (`asc` / `desc`) trên 3 cột: **Tên danh mục (`localName`)**, **Sản phẩm (`productCount`)**, và **Trạng thái (`status`)** mà vẫn giữ nguyên cấu trúc cây Cha - Con liền kề.
- **Phân trang (`Pagination`)**: Phân trang theo cụm Cha - Con (`Family-aware pagination`) đảm bảo danh mục con không bị ngắt sang trang khác tách khỏi danh mục cha.
- **Phân quyền Thao tác (Chỉ `SUPER_ADMIN` & `STORE_MANAGER`)**:
  - Chỉ **Admin (`SUPER_ADMIN`)** và **Quản lý (`STORE_MANAGER`)** mới có quyền **Tạo mới**, **Chỉnh sửa** ([`EditCategoryDialog.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/catalog/components/EditCategoryDialog.tsx)) và **Xóa** ([`DeleteCategoryDialog.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/catalog/components/DeleteCategoryDialog.tsx)) danh mục.
  - Đã loại bỏ nút đồng bộ TikTok Shop trên trang Danh mục theo yêu cầu.

---

## 3. Trang 3: Thẻ Sản Phẩm (`/tags` — [`TagsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/TagsPage.tsx))

- Quản lý danh sách toàn bộ Thẻ sản phẩm (`Hunter x Hunter`, `Chibi Q-Ver`, `Best Seller`, `One Piece`, `Jujutsu Kaisen`, ...).
- Hỗ trợ tạo thẻ mới, đổi tên thẻ đồng loạt trên toàn bộ sản phẩm, xóa thẻ và bấm lọc nhanh danh sách sản phẩm theo từng thẻ.

---

## 4. Trang Thêm Sản Phẩm Mới (`/products/create` — [`CreateProductPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/CreateProductPage.tsx))

Thiết kế là **một trang riêng biệt (`/products/create`)** chuẩn theo cấu trúc biểu mẫu đăng sản phẩm TikTok Shop Seller Center trong [`.feature/test.md`](file:///c:/Users/Admin/Desktop/bonzstore/.feature/test.md):

1. **Thông tin cơ bản (`#sec-basic`)**:
   - `* Hình ảnh sản phẩm`: Quản lý tối đa 9 ảnh vuông tỷ lệ `1:1` (Ảnh đầu tiên là `Ảnh bìa`, hỗ trợ hover Xem trước `Eye` & Xóa `Trash2`).
   - `* Tên sản phẩm`: Kèm bộ đếm ký tự trực tiếp `0/255`.
   - `* Hạng mục`: Chỉ cho phép chọn Hạng mục lá (`isLeaf = true`) đã được uỷ quyền `202405 AVAILABLE`.
   - `* Thương hiệu` & **Thuộc tính sản phẩm (`Thuộc tính`)**: Cho phép thêm/xoá linh hoạt các thuộc tính (`Series Anime`, `Chất liệu`, `Chiều cao`, `Xuất xứ`, `Đóng gói`, `Độ tuổi khuyến nghị`) và gắn `Thẻ phân loại (Tags)`.
2. **Chi tiết sản phẩm (`#sec-details`)**:
   - `* Mô tả`: Trình soạn thảo mô tả sản phẩm kèm nút chèn nhanh cam kết bảo hành.
   - `Video`: Khung thông số chuẩn TikTok Shop (*"Tỷ lệ khung hình video phải từ 9:16 đến 16:9. Kích thước file tối đa: 100 MB. Định dạng: MP4, MOV, MKV, AVI"*).
3. **Thông tin bán hàng (`#sec-sales` — `#sale_properties` & `#skus`)**:
   - **Khối `Biến thể` (`#sale_properties`)**:
     - Tạo tối đa 2 cấp biến thể (`* Tên biến thể`: `Nhân vật`, `Phiên bản`).
     - Danh sách `* Tùy chọn` có bộ đếm `x/50` ký tự, ảnh đại diện biến thể, nút xóa từng tùy chọn và nút `+ Thêm lựa chọn`.
     - Tích hợp nút **Nạp mẫu 11 biến thể Naruto (`test.md`)** (`Sakura`, `Naruto`, `Naruto Rasengan`, `Kakashi`, `Minato`, `Uchiha Sasuke`, `Uchiha Itachi`, `Uchiha Madara`, `Hashirama`, `1 Bé Ngẫu Nhiên`, `Bộ 9 bé`).
   - **Khối `Danh sách biến thể` (`#skus`)**:
     - **Thanh chỉnh sửa hàng loạt (`batch_edit`)**: Lọc theo `Tất cả` hoặc từng tùy chọn + nhập nhanh `Giá bán lẻ (₫)`, `Giá KM (₫)`, `Số lượng tồn kho`, `SKU người bán` + nút **`Áp dụng hàng loạt`** + nút **`Mở rộng toàn màn hình`**.
     - **Bảng SKU**: Hiển thị cột biến thể kèm ảnh `48x48` (hover `Eye` xem ảnh & `Trash2` xóa ảnh), `* Giá bán lẻ (₫)`, `Giá bán / Khuyến mãi (₫)`, `* Hàng có sẵn`, `SKU người bán` (VD: `NRT009`) và nút xóa dòng.
4. **Vận chuyển & Thanh thao tác cố định cuối trang**:
   - Nhập trọng lượng sau đóng gói (`kg`) và kích thước (`Dài × Rộng × Cao cm`).
   - Cột phải hiển thị **Khung Xem Trước TikTok Shop** trực tiếp theo thời gian thực.
   - Thanh dưới cùng hỗ trợ 4 hành động: **`Hủy bỏ`**, **`Lưu bản nháp` (`DRAFT`)**, **`Gửi xét duyệt` (`PENDING`)**, và **`Đăng sản phẩm (Trên kệ)` (`ACTIVE`)**.
