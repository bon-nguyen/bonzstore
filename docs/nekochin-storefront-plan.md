# Tài Liệu Phân Tích Kỹ Thuật & Kế Hoạch Triển Khai Storefront Anime/Kawaii 24H (Nekochin Style) cho BonzStore

Tài liệu này tổng hợp toàn bộ kết quả nghiên cứu kiến trúc UI/UX, hệ thống Font, biến CSS, Keyframes hoạt hình từ `https://nekochin.com/` cùng kế hoạch triển khai 8 giai đoạn cho dự án **BonzStore** (`apps/web` + `apps/api`).

---

## PHẦN 1: THÔNG SỐ KỸ THUẬT & DESIGN TOKENS (TỪ NEKOCHIN.COM)

### 1. Hệ thống Typography (`font-family`)
Tải từ Google Fonts trong `apps/web/src/app/layout.tsx`:
- **Display / Tiêu đề & Badge (`--font-display` / `--kw-font-heading`)**:
  ```css
  --font-display: 'Mali', 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
  ```
  *(Weights: `500`, `600`, `700` — tạo nét viết tay tròn trịa kiểu hoạt hình Nhật Bản).*
- **Body / Nội dung & Nút bấm (`--font-body` / `--kw-font-body`)**:
  ```css
  --font-body: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-main: 'Mulish', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  ```
  *(Weights: `600`, `700`, `800`, `900`).*
- **Monospace / Giá tiền, Mã đơn, Đồng hồ đếm ngược (`--font-mono`)**:
  ```css
  --font-mono: 'Space Grotesk', monospace;
  ```
- **Storybook / Nhật ký Pre-Order (`--nk-font-storybook`)**:
  ```css
  --nk-font-storybook: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
  ```

### 2. Bảng màu Kawaii & Biến Môi trường 24H (`CSS Variables`)
```css
:root {
  /* Kawaii Palette */
  --kw-pastel-pink: #FFB5C2;
  --kw-pastel-pink-dark: #FF8DA1;
  --kw-pastel-blue: #A2D2FF;
  --kw-pastel-purple: #DCD3FF;
  --kw-pastel-yellow: #FFF3B0;
  --kw-pastel-mint: #B8F2E6;
  --kw-cream: #FFFDF9;
  --kw-text-dark: #4A3E3D;
  --kw-text-muted: #8E7F7F;
  --kw-border-color: #4A3E3D;
  --kw-border-width: 2.5px;

  /* Shadows & Radius */
  --kw-shadow-hard: 4px 4px 0px #4A3E3D;
  --kw-shadow-pastel: 4px 4px 0px #FFB5C2;
  --kw-shadow-pop: 0 6px 0 #4A3E3D, 0 10px 20px rgba(74, 62, 61, 0.15);
  --kw-radius-sm: 12px;
  --kw-radius-md: 20px;
  --kw-radius-lg: 30px;
  --kw-radius-pill: 9999px;
}

/* Chế độ Buổi Sáng (06:00 - 11:00): .is-morning */
html.is-morning, body.is-morning {
  --surface-base: #FFFDF9;
  --surface-card: rgba(255, 255, 255, 0.92);
  --text-primary: #4A3E3D;
  --text-secondary: #7A6A68;
  --sky-gradient: linear-gradient(180deg, #BCE0FD 0%, #FFE5EC 55%, #FFFDF9 100%);
}

/* Chế độ Buổi Chiều (11:00 - 18:00): .is-afternoon */
html.is-afternoon, body.is-afternoon {
  --surface-base: #FFF9F0;
  --surface-card: rgba(255, 252, 245, 0.94);
  --text-primary: #4A3E3D;
  --text-secondary: #8C7365;
  --sky-gradient: linear-gradient(180deg, #8ECAE6 0%, #FFE5B4 55%, #FFF9F0 100%);
}

/* Chế độ Ban Đêm (18:00 - 06:00): .is-night */
html.is-night, body.is-night {
  --surface-base: #0E1126;
  --surface-card: rgba(26, 33, 64, 0.92);
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --kw-border-color: #64748B;
  --sky-gradient: linear-gradient(180deg, #090C1B 0%, #1A1F3C 55%, #0E1126 100%);
}
```

### 3. Bố cục 11 Phân cảnh (Storytelling Chapters)
1. **Header "Buồng Lái Bầu Trời" (`HeaderCockpit`)**:
   - Nút gạt 24H (Mặt trời / Nắng trưa / Mặt trăng + Gấu phi hành gia).
   - Huy hiệu `BONZSTORE AIR`, thanh tìm kiếm Live Search Spotlight (debounce 220ms + gợi ý từ khóa), nút mở Bản đồ Kho báu (`<dialog>`), Wishlist badge, Mini-Cart.
2. **Chương 1 — Hero "Khung Cửa Sổ Khoang Tàu Bay" (`#nk-hero-24h`)**:
   - Cột trái: Lời chào đổi theo giờ + thống kê xã hội + CTA vé tàu.
   - Cột phải: Khung cửa sổ máy bay nhìn ra mây trời + 2 ảnh sản phẩm Polaroid dán băng dính.
3. **Chương 2 — Danh mục Anime "Bảng Phấn Lớp Học Phép Thuật" (`#section-magic-chalkboard`)**:
   - Bảng phấn xanh đen `#264636` đóng khung gỗ, bụi phấn, cục tẩy gỗ; các danh mục Anime là ảnh Polaroid dán băng keo mờ.
4. **Chương 3 — Hàng Sẵn "Ga Tàu Tốc Hành Bonz Express" (`#section-train-station`)**:
   - Bảng điện tử nhà ga + đường ray; mỗi thẻ sản phẩm là một **Toa Tàu (`.kw-train-car-card`)** có đèn nóc, cửa sổ bóng kính và 2 bánh xe SVG xoay tròn liên tục.
5. **Chương 4 — Anime Spotlight "Hồ Sơ Thám Tử Tuyệt Mật" (`#section-conan-spotlight`)**:
   - Bìa hồ sơ đinh tán + Radar quét manh mối (`neko-clue-radar`) + thẻ sản phẩm Polaroid đóng dấu đỏ `CONFIDENTIAL` (`.neko-evidence-card`).
6. **Chương 5 — Flash Sale "Quầy Xổ Số Lễ Hội Trên Mây" (`#section-flash-sale`)**:
   - Mái hiên sọc đỏ-trắng + đồng hồ đếm ngược + thẻ sản phẩm dạng **Tấm Vé Số (`.neko-sale-card`)** có 2 khuyết tròn bấm lỗ hai bên hông.
7. **Chương 6 — Hàng Đặt Trước "Cuốn Nhật Ký Pre-Order & Bút Máy Tự Viết" (`#section-preorder-diary`)**:
   - 3 thẻ câu chuyện dẫn nhập + Cuốn sổ lò xo (`.kw-diary-book`) với dải ruy-băng đánh dấu trang, bút máy SVG tự viết (`nkc-diary-writing`) và thẻ sản phẩm dạng **Vé Giữ Chỗ Pop-Art (`.kw-preorder-ticket`)**.
8. **Chương 7 — Video Review "Bảng Gỗ Quảng Cáo Trên Mây" (`.kw-video-section`)**:
   - Bảng gỗ cắm giữa tầng mây + thẻ video dạng cuộn phim 35mm kết hợp khung Polaroid.
9. **Chương 8 — Best-Sellers "Tủ Kính Trưng Bày Bảo Tàng" (`#section-evidence-hot`)**:
   - Tủ kính khung gỗ đồng thau, mỗi sản phẩm đặt trên bệ gỗ mini dưới ánh đèn spotlight.
10. **Chương 9 & 10 — Member Club Banners & Tạp Chí Khinh Khí Cầu (`#section-banner-group`, `#section-home-blog`)**:
    - 3 thẻ đặc quyền bo góc vẽ tay bất đối xứng (`28px 18px 26px 20px`) + chuyên mục tin tức khinh khí cầu.
11. **Chương 11 — Footer "Bến Đỗ Hạ Cánh" (`.kw-landing-wrap`)**:
    - Sóng mây SVG nhiều lớp, bảng phấn đếm số tự động (Count-up), form nhận tin dạng **Phong bì thư hàng không (Airmail)** và cảnh đảo nổi 3D chia tay.

### 4. Các Tính năng Tương tác Thông minh (Micro-Features)
- **Mini-Cart Drawer**: Thanh tiến trình Freeship mốc `500.000₫`, tăng/giảm số lượng debounce, và **Thanh Hoàn Tác (Undo 5 giây)** khi xóa sản phẩm.
- **Wishlist**: Lưu `localStorage`, đồng bộ qua CustomEvent và hiệu ứng SVG trái tim nổ pháo hoa khi bấm.
- **Dynamic Island Pre-Order (`#nkc-di`)**: Thanh thuốc nổi tự mở rộng báo đếm ngược đơn Pre-Order sắp đóng.
- **Lướt ảnh trên thẻ (`ProductImageSwap`) & Quick View (`<dialog>`)**: Di chuột/vuốt ngang trên thẻ sản phẩm để đổi góc ảnh (`1/4`) và mở modal xem nhanh chọn SKU.
- **Mobile Bottom Dock**: Thanh điều hướng 5 tab cố định dưới đáy màn hình di động.

---

## PHẦN 2: LỘ TRÌNH TRIỂN KHAI 8 GIAI ĐOẠN TRÊN BONZSTORE

### Giai đoạn 1: Nền tảng Typography, Design Tokens & Hệ thống Thời gian 24H (`apps/web`)
- Cập nhật `apps/web/src/app/layout.tsx` để nạp Google Fonts (`Mali`, `Nunito`, `Mulish`, `Space Grotesk`).
- Cập nhật `apps/web/src/app/globals.css` và `apps/web/tailwind.config.ts` với hệ biến `--kw-*`, `.is-morning`, `.is-afternoon`, `.is-night` và các `@keyframes` hoạt hình.
- Tạo `apps/web/src/providers/time-mode-provider.tsx` và `apps/web/src/components/storefront/AmbientSkyWorld.tsx`.

### Giai đoạn 2: Mở rộng Public API & Dữ liệu Anime Mẫu (`apps/api` & `apps/web`)
- Mở quyền `@Public()` cho các route đọc sản phẩm/danh mục tại `apps/api/src/modules/products/products.controller.ts` và `apps/api/src/modules/categories/categories.controller.ts`.
- Tạo `apps/web/src/lib/storefront-data.ts` kết nối API thật kèm dữ liệu Anime/Figure mẫu phong phú làm fallback.

### Giai đoạn 3: Header "Buồng Lái Bầu Trời", Bản đồ Kho báu & Tìm kiếm Tức thì
- Xây dựng `HeaderCockpit.tsx`, `SearchOverlay.tsx`, `SkyTreasureMapModal.tsx` và `MobileBottomDock.tsx`.

### Giai đoạn 4: Các Phân cảnh Storytelling — Phần 1 (Chương 1 đến Chương 4)
- Xây dựng `HeroCabinWindow.tsx`, `MagicChalkboardSection.tsx`, `TrainStationSection.tsx` (Toa tàu + bánh xe xoay), và `DetectiveSpotlightSection.tsx` (Radar + Thẻ bằng chứng Polaroid).

### Giai đoạn 5: Các Phân cảnh Storytelling — Phần 2 (Chương 5 đến Chương 8)
- Xây dựng `FlashSaleStallSection.tsx` (Vé số khuyết lỗ), `PreOrderDiarySection.tsx` (Sổ lò xo + Bút máy tự viết + Vé giữ chỗ), `VideoBillboardSection.tsx` và `GlassShowcaseSection.tsx`.

### Giai đoạn 6: Câu Lạc Bộ Thành Viên, Tạp Chí Khinh Khí Cầu & Footer "Bến Đỗ Hạ Cánh"
- Xây dựng `MemberClubBanners.tsx`, `AirshipBlogSection.tsx` và `LandingFooter.tsx` (Sóng mây SVG + Bảng phấn Count-up + Phong bì Airmail).

### Giai đoạn 7: Hệ thống Tương tác E-Commerce Thông minh (Micro-Features)
- Xây dựng `CartProvider` + `MiniCartDrawer.tsx` (Freeship 500k + Undo 5s), `WishlistProvider`, `DynamicIslandPreOrder.tsx`, `QuickViewDialog.tsx` và `ProductImageSwap.tsx`.

### Giai đoạn 8: Kiểm thử, Tối ưu Hiệu năng & Khả năng Truy cập
- Tối ưu `prefers-reduced-motion: reduce`, kiểm tra Responsive Desktop/Mobile và chạy `yarn build` + `yarn lint` cho toàn bộ monorepo.

