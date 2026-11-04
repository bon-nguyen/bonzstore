# Phân Hệ Nhập Hàng (`#55479`), Sổ Quỹ Thu/Chi & Biểu Đồ Phân Tích (`/imports`, `/cashbook`, `/charts`)

> **Các trang Frontend chính**:
> - **Trang Quản lý Nhập hàng & Chi tiết đơn `#55479` (`/imports`)**: [`ImportsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ImportsPage.tsx)
> - **Trang Sổ Quỹ Thu/Chi đa kênh (`/cashbook`)**: [`CashbookPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/CashbookPage.tsx)
> - **Trang Biểu đồ Dòng tiền & Phân tích Nhập hàng (`/charts`)**: [`ChartsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ChartsPage.tsx)
> - **React Query Hooks**: [`useImports.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/imports/hooks/useImports.ts), [`useCashbook.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/features/cashbook/hooks/useCashbook.ts)
> - **API Endpoints & Types**: [`imports.api.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/api/endpoints/imports.api.ts), [`cashbook.api.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/api/endpoints/cashbook.api.ts)

---

## 1. Trang Quản Lý Nhập Hàng Hoà Bình Logistics & 1688 (`/imports` — [`ImportsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ImportsPage.tsx))

### 1.1 Luồng Xác Thực & Đăng Nhập (`POST https://hoabinhlogistics.com/api/authenticate/login`)
- **Giao diện Modal Pop-up Đăng nhập**:
  - Khi người dùng bấm **`Đăng nhập Hoà Bình Logistics`** hoặc **`Pop-up Đăng nhập / Đổi Token`**, hiển thị Modal xác nhận đăng nhập tài khoản Hoà Bình Logistics.
  - **API Đăng nhập**: `POST https://hoabinhlogistics.com/api/authenticate/login` (Proxy qua `POST /api/imports/authenticate/login`).
  - **Response chuẩn**:
    ```json
    {
      "Success": true,
      "Data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      },
      "ResultCode": 200,
      "ResultMessage": null
    }
    ```
  - **Giải mã JWT Token & Lưu trữ State (`decodeHoabinhJwt`)**:
    - Trích xuất trực tiếp từ claim `http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata`:
      - `UserId` (`UID`): `6176`
      - `UserGroupId`: `2`
      - `UserName`: `"tranbon1"`
      - `IsCheckOTP`: `true`, `IsConfirmOTP`: `false`
    - Lưu token an toàn vào `localStorage` + Database (`app_kv_store`) và cập nhật trạng thái giao diện sang **`Đã liên kết tài khoản (UID: 6176)`**.
  - **Xử lý Token hết hạn (`401` / `Expired`)**:
    - Khi phát hiện Token hết hạn hoặc phản hồi `401 Unauthorized`, hệ thống tự động mở lại Modal Pop-up đăng nhập để người dùng xác thực lại (hỗ trợ nút **`Test 401 (Hết hạn Token)`** trên Header để kiểm thử ngay).

### 1.2 Quản Lý Danh Sách Đơn Hàng Theo 3 Tabs & Tích Hợp 3rd-Party API
- **API Lấy Danh sách Đơn hàng**:
  - `GET https://hoabinhlogistics.com/api/main-order?OrderBy=Id+desc&PageIndex=1&PageSize=20&UID=6176&OrderType={OrderType}`
  - Headers: `Authorization: Bearer {token_da_luu}`, `Content-Type: application/json`
- **3 Tabs Quản Lý Đơn Hàng (Tất cả đều có thao tác `Chi tiết`, `Duyệt đơn`, `Nháp`, `Hiện tại`)**:
  1. **Tab 1 — Danh sách đơn (Hiện tại)**: Truyền `OrderType = 1`
  2. **Tab 2 — Danh sách đơn (Bản nháp)**: Truyền `OrderType = 0`
  3. **Tab 3 — Danh sách đơn (Đã duyệt)**: Truyền `OrderType = 2` (Tự động đồng bộ vào Kho Sản Phẩm `/products` và Sổ Quỹ `/cashbook`)
- **UI/UX States**:
  - **Loading State**: Skeleton pulse khi chuyển tab hoặc gọi API.
  - **Empty State**: Hiển thị thông báo *"Chưa có đơn hàng nào trong danh mục này"* kèm nút chuyển tab / khôi phục dữ liệu mẫu.
  - **Pagination**: Hỗ trợ chuyển trang (`PageIndex`) và đổi kích thước trang (`PageSize`: `10`, `20`, `50`).

### 1.3 Quy Trình 3 Bước Kết Nối & Lấy Chi Tiết Đơn Hàng (`55479`)
1. **Bước 1 — Open Tabs để Login**:
   - Nút **`1. Open Tab Login Hoà Bình`** mở cổng khách hàng `https://hoabinhlogistics.com` trong tab mới để đăng nhập tài khoản (`tranbon1` / `bon.nguyentranvn@gmail.com`, `UID: 6176`).
   - Nút **`Mở Tab API #55479`** mở trực tiếp endpoint `https://hoabinhlogistics.com/api/main-order/55479`.
2. **Bước 2 — Lấy & Lưu Bearer Token**:
   - Ô nhập Bearer Token lấy từ Hoà Bình Logistics + nút **`Lưu Token`** (`POST /api/imports/token`) và nút **`Nạp Token Mẫu`**.
3. **Bước 3 — Lấy Chi Tiết Đơn & Lưu Data Nhập Hàng (`POST /api/imports/fetch-order`)**:
   - Cho phép nhập mã đơn (`55479`) hoặc full URL (`https://hoabinhlogistics.com/api/main-order/55479`), hoặc dán trực tiếp chuỗi JSON.
   - **Tích hợp cơ chế Auto-Restore Data khi gọi API**:
     - Khi gọi API lấy đơn hoặc truy cập danh sách đơn nhập hàng, nếu token ngoài hết hạn hoặc DB bị làm mới, hệ thống tự động khôi phục (`Restore`) đầy đủ dữ liệu chuẩn của đơn hàng `#55479` từ [`hoabinh-order-55479.data.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/imports/data/hoabinh-order-55479.data.ts).
   - **Tương thích 100% với Production hiện tại**:
     - Tự động đồng bộ 3 dòng sản phẩm 1688 (`ItemId: 1073254875055` — *Mô hình Chibi Kimetsu no Yaiba Dáng Ngủ 8 mẫu*, và `ItemId: 1060302986040` — *Mô hình Naruto Shippuden Đại Chiến Nhẫn Giả 6 mẫu & 9 mẫu*) vào bảng `products` và `product_skus` trên trang `/products`.
     - Tự động đồng bộ 2 giao dịch trong `PayOrderHistories` (`#72865` Đặt cọc `7.378.400₫` Ví điện tử & `#74261` Thanh toán `2.465.876₫` Trực tiếp) thành 2 Phiếu Chi trong **Sổ Quỹ (`/cashbook`)**.

### 1.2 Khung Chi Tiết Đơn Hàng `#55479` (5 Tabs Chuyên Sâu)
- **Tab 1 — Danh sách Sản phẩm 1688 (`Orders` - 3 dòng / 50 sản phẩm)**:
  - Dòng `#177035` (`ItemId: 1073254875055`): `Q版鬼灭潮玩我妻善逸弥豆子动漫睡眠手办小摆件人偶桌面车载` (`;被窝睡眠鬼灭8款（袋装）`) — SL: `10`, Đơn giá: `14¥` (`56.140₫`), Thành tiền: `140¥` (`561.400₫`).
  - Dòng `#177034` (`ItemId: 1060302986040`): `终极火影疾风传终极之战潮玩公仔鸣人卡卡西盲盒潮玩儿童玩具手办` (`;6款终极火影袋装`) — SL: `20`, Đơn giá: `43¥` (`172.430₫`), Thành tiền: `860¥` (`3.448.600₫`).
  - Dòng `#177033` (`ItemId: 1060302986040`): `终极火影疾风传终极之战潮玩公仔鸣人卡卡西盲盒潮玩儿童玩具手办` (`;终极火影9款袋装`) — SL: `20`, Đơn giá: `65¥` (`260.650₫`), Thành tiền: `1.300¥` (`5.213.000₫`).
- **Tab 2 — Kiện hàng & Mã vận đơn (`SmallPackages` - 4 kiện, Tổng `34.04 kg`, Cước cân `510.600₫`)**:
  - Kiện `#495068` (`500281968977`): `0.00 kg` — `Chưa về kho TQ` (Ghi chú: `3k`).
  - Kiện `#495282` (`50028196897700030003`): `18.86 kg` × `15.000₫/kg` = `282.900₫` — Bao lớn `K910-118 118T` — `Đã giao khách hàng` (`KHOHN.BATU`).
  - Kiện `#495283` (`50028196897700030002`): `12.78 kg` × `15.000₫/kg` = `191.700₫` — Bao lớn `K910-118 118T` — `Đã giao khách hàng`.
  - Kiện `#495286` (`50028196897700030001`): `2.40 kg` × `15.000₫/kg` = `36.000₫` — Bao lớn `K910-118 118T` — `Đã giao khách hàng`.
- **Tab 3 — Lịch sử Thanh toán (`PayOrderHistories`)**:
  - `#72865` (`07/10/2026 09:20`): **Đặt cọc** `7.378.400₫` (`Ví điện tử` — `tranbon1`) → Phiếu chi `PC-HB72865`.
  - `#74261` (`18/10/2026 15:26`): **Thanh toán** `2.465.876₫` (`Trực tiếp` — `KHOHN.BATU`) → Phiếu chi `PC-HB74261`.
- **Tab 4 — Tiến trình Vận chuyển & Người nhận**:
  - Hiển thị đầy đủ 8 mốc thời gian từ lúc tạo đơn (`07/10/2026`) tới khi hoàn thành (`22/10/2026`) và thông tin người nhận (`bon` — `0354888977` — `1705 Huỳnh Tấn Phát, Phú Mỹ, Quận 7, TP.HCM`).
- **Tab 5 — Trao đổi CSKH (`OrderComments`) & Raw JSON**:
  - Hiển thị 3 tin nhắn trao đổi của `tranbon1` (`"Free vận chuyển nội địa"` + 2 ảnh đính kèm) và trình xem JSON gốc.

---

## 2. Trang Sổ Quỹ Thu/Chi (`/cashbook` — [`CashbookPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/CashbookPage.tsx))

### 2.1 Khối 4 Thẻ Tổng Hợp Quỹ (Theo Đúng Công Thức Chuẩn)
1. **Đầu kỳ (`openingBalance`)**:
   - Tổng quỹ đầu kỳ kèm chi tiết: `+ Tiền mặt`, `+ Thẻ`, `+ Chuyển khoản` (Hỗ trợ nút **Cấu hình** để cập nhật số dư đầu kỳ).
2. **Tổng thu (`totalIncome`)**:
   - `+ Tiền mặt`
   - `+ Thẻ`
   - `+ Chuyển khoản`
3. **Tổng chi (`totalExpense`)**:
   - `+ Tiền mặt`
   - `+ Thẻ`
   - `+ Chuyển khoản`
4. **Cuối kỳ (`closingBalance`)**:
   - Công thức tự động: **`Cuối kỳ = Đầu kỳ + Tổng thu - Tổng chi`**
   - Hiển thị chi tiết tồn quỹ cuối kỳ theo 3 kênh: `+ Tiền mặt cuối kỳ`, `+ Thẻ cuối kỳ`, `+ Chuyển khoản cuối kỳ`.

### 2.2 Thanh Tìm Kiếm, Bộ Lọc & 2 Nút Lập Phiếu
- **Search (`Debounce 400ms`)**: Tìm kiếm theo Mã phiếu (`PC-HB72865`, `PT-...`), Phân loại, Nội dung, Người nhận/nộp, Người thu/chi.
- **Bộ lọc**: Lọc theo Loại phiếu (`Tất cả`, `Phiếu Thu`, `Phiếu Chi`), Kênh thanh toán (`Tiền mặt`, `Thẻ`, `Chuyển khoản`), và Phân loại.
- **Thao tác chính**:
  - **`+ Lập Phiếu Thu`** (`type: 'INCOME'`)
  - **`- Lập Phiếu Chi`** (`type: 'EXPENSE'`)
  - **`Restore Data`** (`POST /api/cashbook/restore`)

### 2.3 Cấu Trúc Bảng Sổ Quỹ 10 Cột Chuẩn
| STT | Tên Cột | Trường Dữ Liệu | Mô Tả |
| :-: | :--- | :--- | :--- |
| 1 | **Thời gian** | `transactionDate` | Ngày giờ phát sinh phiếu Thu/Chi |
| 2 | **Mã Phiếu** | `voucherCode` | Mã phiếu (VD: `PC-HB72865`, `PC-HB74261`, `PT-202610-001`) kèm link đơn nhập `#55479` |
| 3 | **Phân Loại** | `category` & `type` | Badge `Phiếu Thu` / `Phiếu Chi` + Nhóm phân loại |
| 4 | **Nội Dung** | `content` | Diễn giải chi tiết giao dịch |
| 5 | **Tiền mặt** | `cashAmount` | Số tiền thu/chi bằng Tiền mặt |
| 6 | **Thẻ** | `cardAmount` | Số tiền thu/chi qua Thẻ POS / Visa |
| 7 | **Chuyển Khoản** | `transferAmount` | Số tiền thu/chi qua Chuyển khoản ngân hàng / Ví điện tử |
| 8 | **Tổng tiền** | `totalAmount` | `Tiền mặt + Thẻ + Chuyển khoản` (`+` Xanh lá cho Thu, `-` Đỏ hồng cho Chi) |
| 9 | **Người nhận, Nộp** | `partnerName` | Đối tượng nộp tiền (Phiếu Thu) hoặc nhận tiền (Phiếu Chi) |
| 10 | **Người thu Chi** | `staffName` | Nhân sự thực hiện thu/chi (VD: `tranbon1 (bon)`, `Admin BonzStore`) |

---

## 3. Trang Biểu Đồ & Phân Tích (`/charts` — [`ChartsPage.tsx`](file:///c:/Users/Admin/Desktop/bonzstore/apps/dashboard/src/pages/ChartsPage.tsx))

1. **Biểu đồ 1 — Xu hướng Dòng tiền Thu - Chi & Biến động Tồn quỹ theo ngày**:
   - Biểu đồ cột đôi (`Tổng Thu` vs `Tổng Chi`) kết hợp cột `Tồn quỹ Cuối kỳ` lũy kế sau mỗi ngày giao dịch.
   - Hỗ trợ chuyển đổi chế độ xem: `Tổng Thu vs Tổng Chi`, `Phân bổ Thu (TM/Thẻ/CK)`, `Phân bổ Chi (TM/Thẻ/CK)` và hover xem chi tiết từng ngày.
2. **Biểu đồ 2 — Cơ cấu 3 Kênh Thanh toán (`Tiền mặt` • `Thẻ` • `Chuyển khoản`)**:
   - Thanh tỷ trọng tồn quỹ cuối kỳ và bảng đối chiếu `Đầu kỳ / +Tổng thu / -Tổng chi / Cuối kỳ` cho từng kênh.
3. **Biểu đồ 3 — Phân tích Cơ cấu Giá vốn, Trọng lượng & Mặt hàng Đơn nhập `#55479`**:
   - Tỷ trọng chi phí nhập (`Tiền hàng 1688: 9.223.000₫ [93.69%]`, `Cước cân nặng 34.04kg: 510.600₫ [5.19%]`, `Phí mua hộ: 110.676₫ [1.12%]`).
   - Phân bổ trọng lượng theo 4 kiện `SmallPackages` (`18.86kg`, `12.78kg`, `2.40kg`, `0kg`).
   - Phân bổ giá trị theo 3 mặt hàng Anime 1688 (`Naruto 9 mẫu: 5.213.000₫`, `Naruto 6 mẫu: 3.448.600₫`, `Kimetsu 8 mẫu: 561.400₫`).
4. **Biểu đồ 4A & 4B — Tỷ trọng Doanh thu theo Phân loại Thu & Chi phí theo Phân loại Chi**.

