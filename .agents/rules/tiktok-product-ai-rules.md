# Quy tắc AI Gợi ý Tên & Nội dung Sản phẩm chuẩn TikTok Shop (BonzStore)

File quy tắc này định nghĩa chuẩn cấu trúc đặt tên sản phẩm (Title SEO), bộ tiêu chí chấm điểm chất lượng tiêu đề, và cấu trúc mô tả HTML cho **AI Product Assistant** trên trang **Thêm sản phẩm mới (`/products/create`)** và **Chỉnh sửa sản phẩm**.

---

## 1. Công thức Cấu trúc Tên Sản phẩm Chuẩn TikTok Shop

Mọi tên sản phẩm mô hình / vật phẩm sưu tầm Anime trên BonzStore khi đồng bộ lên TikTok Shop cần tuân thủ công thức **6 thành phần chuẩn SEO**:

```text
[Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU
```

### Giải thích chi tiết 6 thành phần:

| Thứ tự | Thành phần | Quy tắc định dạng | Ví dụ chuẩn | Nguồn dữ liệu trên Form |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **`[Thương hiệu]`** | Đặt trong dấu ngoặc vuông `[...]` ở đầu tiêu đề. Nếu không có thương hiệu thì dùng `[No Brand]` hoặc `[Chính Hãng]`. | `[Good Smile Company]`, `[Bandai Spirits]`, `[Banpresto]`, `[Kotobukiya]` | Trường `brandName` (`Thương hiệu`) |
| **2** | **`Loại mô hình`** | Từ khóa danh mục / phân loại sản phẩm chính giúp thuật toán TikTok Shop phân phối đúng tệp khách hàng. | `Mô hình Figure PVC`, `Mô hình Nendoroid`, `Mô hình lắp ráp Gunpla HG 1/144`, `Standee Acrylic` | Trường `categoryId` (`Hạng mục Con`) & `attributes['Tỷ lệ (Scale)']` |
| **3** | **`Series Anime`** | Tên bộ Anime / Manga / Game gốc của sản phẩm. | `Jujutsu Kaisen`, `One Piece`, `Demon Slayer Kimetsu no Yaiba`, `Mobile Suit Gundam` | Thuộc tính `attributes['Series Anime']` |
| **4** | **`Nhân vật`** | Tên nhân vật + phiên bản trang phục / tư thế (Ver.). | `Gojo Satoru Shibuya Ver.`, `Monkey D. Luffy Gear 5`, `Roronoa Zoro King of Hell` | Nhóm biến thể `variationGroups` (`Nhân vật / Phiên bản`) hoặc nhập trực tiếp |
| **5** | **`Kích thước`** | Chiều cao thực tế hoặc tỷ lệ mô hình kèm đơn vị (`cm`, `mm`, `Scale 1/7`). | `Cao 24cm`, `Cao 10cm`, `Tỷ lệ 1/7 (25cm)` | Thuộc tính `attributes['Chiều cao (cm)']` hoặc `attributes['Tỷ lệ (Scale)']` |
| **6** | **`Mã SKU`** | Mã định danh người bán (`Seller SKU`) đặt ở cuối tiêu đề để dễ tra cứu kho và đồng bộ đơn hàng. | `SKU FIG-JJK-GOJO-01`, `(Mã: OP-LUFFY-G5)` | Trường `skus[0].sellerSku` (`Seller SKU`) |

---

## 2. Ví dụ Tên sản phẩm đạt chuẩn 100/100 điểm SEO

1. **Figure PVC / Scale Figure**:
   `[Good Smile Company] Mô hình Figure PVC Jujutsu Kaisen Gojo Satoru Shibuya Ver. Cao 24cm - Mã FIG-JJK-GOJO-01`
2. **Nendoroid / Chibi**:
   `[Good Smile Company] Mô hình Nendoroid Chibi Chainsaw Man Denji & Pochita Chính Hãng Cao 10cm - SKU NEN-CSM-DENJI`
3. **Gunpla / Model Kit**:
   `[Bandai Spirits] Mô hình lắp ráp Gunpla HG 1/144 Mobile Suit Gundam Aerial Rebuild Cao 13cm - Mã GUN-HG-AERIAL`
4. **Manga / Light Novel / Artbook**:
   `[NXB Kim Đồng] Truyện tranh Manga One Piece Tập 105 Bản Đặc Biệt Kèm Standee Khổ 18cm - SKU MANGA-OP-105`

---

## 3. Tiêu chí Chấm điểm SEO Tiêu đề (AI Title Score: 0 – 100 điểm)

AI đánh giá tiêu đề theo thời gian thực dựa trên 6 thành phần trong công thức:

1. **Có `[Thương hiệu]` trong ngoặc vuông ở đầu** (+18 điểm)
2. **Có `Loại mô hình` / từ khóa danh mục** (`Mô hình`, `Figure`, `Nendoroid`, `Gunpla`, `Standee`, `Cosplay`, `Manga`...) (+18 điểm)
3. **Có `Series Anime`** khớp với thuộc tính Series hoặc danh sách Anime phổ biến (+18 điểm)
4. **Có `Nhân vật` / Phiên bản** (+16 điểm)
5. **Có `Kích thước`** (`cm`, `mm`, `1/7`, `1/144`, `1/6`...) (+15 điểm)
6. **Có `Mã SKU`** (`SKU`, `Mã`, hoặc khớp mã `sellerSku` trong bảng biến thể) (+15 điểm)

> **Quy tắc độ dài vàng trên TikTok Shop**: Độ dài lý tưởng từ **60 – 150 ký tự** (tối thiểu 25 ký tự, tối đa 255 ký tự). Không spam từ khóa trùng lặp hoặc ký tự đặc biệt vô nghĩa (`!!!`, `@@@`).

---

## 4. Quy tắc AI Tạo Mô tả Sản phẩm (`descriptionHtml`)

Khi người dùng bấm **"AI Viết mô tả chuẩn TikTok Shop"**, AI tự động tổng hợp dữ liệu đã nhập trên form (`title`, `brandName`, `category`, `attributes`, `skus`, `packageWeight`, `packageDimensions`) để sinh nội dung HTML gồm 4 phần:

1. **Giới thiệu nổi bật**: Tóm tắt tên sản phẩm, thương hiệu, Series Anime và nhân vật.
2. **Bảng thông số kỹ thuật (`<ul>` / `<table>`)**:
   - Thương hiệu, Xuất xứ, Chất liệu (`PVC & ABS`), Chiều cao (`cm`), Tỷ lệ (`Scale`), Tình trạng (`Fullbox / Seal`).
   - Danh sách các phân loại / biến thể và mã SKU tương ứng.
3. **Hướng dẫn bảo quản & trưng bày**: Tránh ánh nắng trực tiếp, vệ sinh bằng cọ mềm.
4. **Cam kết từ BonzStore**: Đóng gói chống sốc 3 lớp, hỗ trợ quay video unbox, bảo hành đổi trả theo chính sách TikTok Shop.

