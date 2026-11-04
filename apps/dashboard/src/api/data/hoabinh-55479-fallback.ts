import {
  CashbookChartsAnalyticsResponse,
  CashbookPaginatedResponse,
  CashbookSummaryReport,
  CashbookVoucherItem,
  CreateCashbookVoucherPayload,
} from '../types/cashbook.types';
import {
  HoabinhDecodedJwt,
  HoabinhLoginPayload,
  HoabinhLoginResponse,
  HoabinhMainOrderData,
  ImportOrdersPaginatedResponse,
  ImportOrderStats,
  ImportOrderTabType,
  ImportTokenConfig,
  StoredImportOrderRecord,
} from '../types/imports.types';

export const HOABINH_REAL_JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoie1wiVXNlcklkXCI6NjE3NixcIlVzZXJHcm91cElkXCI6MixcIlVzZXJOYW1lXCI6XCJ0cmFuYm9uMVwiLFwiSXNDaGVja09UUFwiOnRydWUsXCJSb2xlc1wiOm51bGwsXCJJc0NvbmZpcm1PVFBcIjpmYWxzZX0iLCJuYmYiOjE3OTM3MjU2MzAsImV4cCI6MTc5MzgzNzIzMCwiaWF0IjoxNzkzNzI1NjMwfQ.D72EKNd37kG2FtN_-B879IhmeK0IAYK__SVYbBJ7dPo';

export function decodeHoabinhJwt(rawToken: string): HoabinhDecodedJwt {
  try {
    const clean = (rawToken || '').trim().replace(/^Bearer\s+/i, '');
    const parts = clean.split('.');
    if (parts.length >= 2) {
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
      const payloadJson = decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const parsed = JSON.parse(payloadJson);
      const claimKey =
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata';
      let userData = {
        UserId: 6176,
        UserGroupId: 2,
        UserName: 'tranbon1',
        IsCheckOTP: true,
        Roles: null as string[] | null,
        IsConfirmOTP: false,
      };
      if (parsed[claimKey]) {
        const inner =
          typeof parsed[claimKey] === 'string'
            ? JSON.parse(parsed[claimKey])
            : parsed[claimKey];
        userData = {
          UserId: Number(inner.UserId || 6176),
          UserGroupId: Number(inner.UserGroupId || 2),
          UserName: String(inner.UserName || 'tranbon1'),
          IsCheckOTP: Boolean(inner.IsCheckOTP ?? true),
          Roles: inner.Roles || null,
          IsConfirmOTP: Boolean(inner.IsConfirmOTP ?? false),
        };
      } else if (parsed.uid || parsed.username) {
        userData.UserId = Number(parsed.uid || 6176);
        userData.UserName = String(parsed.username || 'tranbon1');
      }
      const exp = parsed.exp ? Number(parsed.exp) : 1793837230;
      const nowSec = Math.floor(Date.now() / 1000);
      return {
        userData,
        nbf: parsed.nbf ? Number(parsed.nbf) : 1793725630,
        exp,
        iat: parsed.iat ? Number(parsed.iat) : 1793725630,
        isExpired: exp < nowSec,
      };
    }
  } catch {
    // fallback default decoded claims
  }
  return {
    userData: {
      UserId: 6176,
      UserGroupId: 2,
      UserName: 'tranbon1',
      IsCheckOTP: true,
      Roles: null,
      IsConfirmOTP: false,
    },
    nbf: 1793725630,
    exp: 1793837230,
    iat: 1793725630,
    isExpired: false,
  };
}

export const HOABINH_ORDER_55479_DATA: HoabinhMainOrderData = {
  Id: 55479,
  UID: 6176,
  UserName: 'tranbon1',
  FullName: 'bon',
  Email: 'bon.nguyentranvn@gmail.com',
  Phone: '0354888977',
  Wallet: 7017.0,
  Address: '1705 Huỳnh Tấn Phát, Phú Mỹ, Quận 7, Thành phố Hồ Chí Minh',
  ReceiverFullName: 'bon',
  ReceiverPhone: '0354888977',
  ReceiverEmail: 'bon.nguyentranvn@gmail.com',
  DeliveryAddress:
    '1705 Huỳnh Tấn Phát, Phú Mỹ, Quận 7, Thành phố Hồ Chí Minh',
  Status: 14,
  StatusName: 'Đã hoàn thành',
  OrderType: 1,
  OrderTypeName: 'Đơn hàng mua hộ',
  FromPlaceName: 'Quảng Châu',
  ReceivePlaceName: 'Hồ Chí Minh',
  ShippingTypeName: 'NHANH - TIẾT KIỆM',
  TotalPriceVND: 9844276.0,
  TotalOrderAmount: 9844276.0,
  AmountDeposit: 7378400.0,
  Deposit: 9844276.0,
  RemainingAmount: 0.0,
  PriceVND: 9223000.0,
  PriceCNY: 2300.0,
  TotalPriceReal: 9223000.0,
  TotalPriceRealCNY: 2300.0,
  CurrentCNYVN: 4010.0,
  FeeBuyPro: 110676.0,
  FeeBuyProCNY: 27.6,
  CKFeeBuyPro: 27.6,
  FeeWeight: 510600.0,
  OrderWeight: 34.04,
  TQVNWeight: 34.04,
  LessDeposit: 80.0,
  ShopId: '2219358604313',
  ShopName: '中山市源柯玩具商行（个体工商户）',
  Site: '1688',
  ImageOrigin:
    'https://cbu01.alicdn.com/img/ibank/O1CN01IxzLCZ1LucH1chua_!!2219358604313-0-cib.jpg',
  OrdererUserName: 'dhkimlien',
  SalerUserName: 'KDdohuyen2004',
  ReceivedBy: 'KHOHN.BATU',
  WaitHCMBy: 'khohn.baongoc',
  GoingHCMBy: '',
  StaffNote: '',
  Note: null,
  Created: '2026-10-07T09:10:34.7965631+07:00',
  CreatedBy: 'tranbon1',
  Updated: '2026-10-22T00:57:47.72+07:00',
  UpdatedBy: 'Auto',
  DepositDate: '2026-10-07T09:20:30.278776+07:00',
  DateBuy: '2026-10-07T16:44:23.9002411+07:00',
  DateBuying: '2026-10-07T13:44:54.7625632+07:00',
  DateDelivery: '2026-10-08T13:38:42.813453+07:00',
  DateBackToVN: '2026-10-15T07:15:06.3457249+07:00',
  DateWaitHCM: '2026-10-17T09:47:13.6098497+07:00',
  DateGoingHCM: '2026-10-17T10:14:32+07:00',
  DateVN: '2026-10-17T10:14:42.1428158+07:00',
  DateReceived: '2026-10-18T15:26:15.2581897+07:00',
  PayDate: '2026-10-18T15:26:15.2581897+07:00',
  CompleteDate: '2026-10-22T00:57:47.72+07:00',
  MainOrderCodes: [
    {
      MainOrderID: 55479,
      Code: '5127805405728007936',
      OrderTransactionCode: [
        '500281968977',
        '50028196897700030003',
        '50028196897700030002',
        '50028196897700030001',
      ],
      RowNumber: 0,
      Id: 38023,
      Created: '2026-10-07T10:58:50.6757109+07:00',
      CreatedBy: 'dhkimlien',
    },
  ],
  SmallPackages: [
    {
      Id: 495068,
      MainOrderId: 55479,
      MainOrderCode: 'Mua hộ: 55479',
      OrderTransactionCode: '500281968977',
      BigPackageId: null,
      BigPackageName: null,
      Weight: 0.0,
      Volume: 0.0,
      PayableWeight: 0.0,
      DonGia: 0.0,
      PriceWeight: 0.0,
      TotalPrice: 0.0,
      Status: 2,
      StatusName: 'Chưa về kho TQ',
      Description: '3k',
      Code: '5127805405728007936',
      BackToVNBy: null,
      DateInTQWarehouse: null,
      DateBackToVN: null,
      DateWaitHCM: null,
      WaitHCMBy: null,
      DateGoingHCM: null,
      GoingHCMBy: null,
      DateInLasteWareHouse: null,
      DateOutWarehouse: null,
      StaffVNWarehouse: '',
      StaffVNOutWarehouse: '',
      Created: '2026-10-08T13:38:42.837891+07:00',
      CreatedBy: 'dhkimlien',
      Updated: null,
      UpdatedBy: null,
    },
    {
      Id: 495282,
      MainOrderId: 55479,
      MainOrderCode: 'Mua hộ: 55479',
      OrderTransactionCode: '50028196897700030003',
      BigPackageId: 12472,
      BigPackageName: 'K910-118      118T',
      Weight: 18.86,
      Volume: 0.0,
      PayableWeight: 18.86,
      DonGia: 15000.0,
      PriceWeight: 15000.0,
      TotalPrice: 282900.0,
      Status: 13,
      StatusName: 'Đã giao khách hàng',
      Description: '',
      Code: '5127805405728007936',
      BackToVNBy: 'CSKH1_BAONGOC',
      DateInTQWarehouse: '2026-10-09T17:28:06.6010744+07:00',
      DateBackToVN: '2026-10-15T07:15:06.3457249+07:00',
      DateWaitHCM: '2026-10-17T09:27:56.4817981+07:00',
      WaitHCMBy: 'khohn.baongoc',
      DateGoingHCM: '2026-10-17T10:14:32+07:00',
      GoingHCMBy: 'KHOHN.BATU',
      DateInLasteWareHouse: '2026-10-17T10:14:42.1428158+07:00',
      DateOutWarehouse: '2026-10-18T15:26:15.2581897+07:00',
      StaffVNWarehouse: 'KHOHN.BATU',
      StaffVNOutWarehouse: 'KHOHN.BATU',
      Created: '2026-10-09T17:28:07.0584634+07:00',
      CreatedBy: 'kt1ngocdiep',
      Updated: '2026-10-18T15:26:15.2625208+07:00',
      UpdatedBy: 'KHOHN.BATU',
    },
    {
      Id: 495283,
      MainOrderId: 55479,
      MainOrderCode: 'Mua hộ: 55479',
      OrderTransactionCode: '50028196897700030002',
      BigPackageId: 12472,
      BigPackageName: 'K910-118      118T',
      Weight: 12.78,
      Volume: 0.0,
      PayableWeight: 12.78,
      DonGia: 15000.0,
      PriceWeight: 15000.0,
      TotalPrice: 191700.0,
      Status: 13,
      StatusName: 'Đã giao khách hàng',
      Description: '',
      Code: '5127805405728007936',
      BackToVNBy: 'CSKH1_BAONGOC',
      DateInTQWarehouse: '2026-10-09T17:28:06.6010744+07:00',
      DateBackToVN: '2026-10-15T07:15:06.3457249+07:00',
      DateWaitHCM: '2026-10-17T09:30:18.6997305+07:00',
      WaitHCMBy: 'khohn.baongoc',
      DateGoingHCM: '2026-10-17T10:14:32+07:00',
      GoingHCMBy: 'KHOHN.BATU',
      DateInLasteWareHouse: '2026-10-17T10:14:42.1428158+07:00',
      DateOutWarehouse: '2026-10-18T15:26:15.2581897+07:00',
      StaffVNWarehouse: 'KHOHN.BATU',
      StaffVNOutWarehouse: 'KHOHN.BATU',
      Created: '2026-10-09T17:28:07.0964918+07:00',
      CreatedBy: 'kt1ngocdiep',
      Updated: '2026-10-18T15:26:15.2671636+07:00',
      UpdatedBy: 'KHOHN.BATU',
    },
    {
      Id: 495286,
      MainOrderId: 55479,
      MainOrderCode: 'Mua hộ: 55479',
      OrderTransactionCode: '50028196897700030001',
      BigPackageId: 12472,
      BigPackageName: 'K910-118      118T',
      Weight: 2.4,
      Volume: 0.0,
      PayableWeight: 2.4,
      DonGia: 15000.0,
      PriceWeight: 15000.0,
      TotalPrice: 36000.0,
      Status: 13,
      StatusName: 'Đã giao khách hàng',
      Description: '',
      Code: '5127805405728007936',
      BackToVNBy: 'CSKH1_BAONGOC',
      DateInTQWarehouse: '2026-10-09T17:28:06.6010744+07:00',
      DateBackToVN: '2026-10-15T07:15:06.3457249+07:00',
      DateWaitHCM: '2026-10-17T09:47:13.6098497+07:00',
      WaitHCMBy: 'khohn.baongoc',
      DateGoingHCM: '2026-10-17T10:14:32+07:00',
      GoingHCMBy: 'KHOHN.BATU',
      DateInLasteWareHouse: '2026-10-17T10:14:42.1428158+07:00',
      DateOutWarehouse: '2026-10-18T15:26:15.2581897+07:00',
      StaffVNWarehouse: 'KHOHN.BATU',
      StaffVNOutWarehouse: 'KHOHN.BATU',
      Created: '2026-10-09T17:28:07.2079215+07:00',
      CreatedBy: 'kt1ngocdiep',
      Updated: '2026-10-18T15:26:15.2686222+07:00',
      UpdatedBy: 'KHOHN.BATU',
    },
  ],
  Orders: [
    {
      Id: 177035,
      MainOrderId: 55479,
      ItemId: '1073254875055',
      TitleOrigin: 'Q版鬼灭潮玩我妻善逸弥豆子动漫睡眠手办小摆件人偶桌面车载',
      TitleTranslated:
        '[BonzStore] Mô Hình Chibi Kimetsu no Yaiba Zenitsu & Nezuko Dáng Ngủ Đắp Chăn (Bộ 8 Mẫu Túi)',
      Property: ';被窝睡眠鬼灭8款（袋装）',
      PropertyTranslated:
        'Bộ 8 mẫu Thanh Gươm Diệt Quỷ ngủ trong chăn (Đóng túi)',
      Quantity: 10,
      RealPrice: 23.0,
      PriceOrigin: 14.0,
      PricePromotion: 14.0,
      UPriceBuy: 14.0,
      UPriceBuyVN: 56140.0,
      PriceCNY: 140.0,
      PriceVND: 561400.0,
      TotalPriceVND: 92230.0,
      CurrentCNYVN: 4010.0,
      ImageOrigin:
        'https://cbu01.alicdn.com/img/ibank/O1CN01IxzLCZ1LucH1chua_!!2219358604313-0-cib.jpg',
      LinkOrigin:
        'https://detail.1688.com/offer/1073254875055.html?spm=a2615.pc_new_goods/2506.wp_pc_new_product_list.0',
      ShopId: '2219358604313',
      ShopName: '中山市源柯玩具商行（个体工商户）',
      Wangwang: '中山市源柯玩具商行（个体工商户）',
      Site: '1688',
      Stock: 9999,
      StepPrice: '30-99:23|100-199:22|200-99999999:21|',
      ProductStatusName: 'Còn hàng',
      StatusComplainName: 'Chưa khiếu nại',
      Created: '2026-10-07T09:10:34.7987652+07:00',
      CreatedBy: 'tranbon1',
    },
    {
      Id: 177034,
      MainOrderId: 55479,
      ItemId: '1060302986040',
      TitleOrigin: '终极火影疾风传终极之战潮玩公仔鸣人卡卡西盲盒潮玩儿童玩具手办',
      TitleTranslated:
        '[BonzStore] Mô Hình Naruto Shippuden Đại Chiến Nhẫn Giả Naruto & Kakashi Blindbox Chibi',
      Property: ';6款终极火影袋装',
      PropertyTranslated: 'Bộ 6 mẫu Naruto Đại Chiến Nhẫn Giả (Đóng túi)',
      Quantity: 20,
      RealPrice: 43.0,
      PriceOrigin: 43.0,
      PricePromotion: 43.0,
      UPriceBuy: 43.0,
      UPriceBuyVN: 172430.0,
      PriceCNY: 43.0,
      PriceVND: 172430.0,
      TotalPriceVND: 172430.0,
      CurrentCNYVN: 4010.0,
      ImageOrigin:
        'https://cbu01.alicdn.com/img/ibank/O1CN014Ae4SU1hjPNeI12vF_!!2219358604313-0-cib.jpg',
      LinkOrigin:
        'https://detail.1688.com/offer/1060302986040.html?spm=a2615.pc_new_goods/2506.wp_pc_new_product_list.0',
      ShopId: '2219358604313',
      ShopName: '中山市源柯玩具商行（个体工商户）',
      Wangwang: '中山市源柯玩具商行（个体工商户）',
      Site: '1688',
      Stock: 632807,
      StepPrice: '',
      ProductStatusName: 'Còn hàng',
      StatusComplainName: 'Chưa khiếu nại',
      Created: '2026-10-07T09:10:34.7987651+07:00',
      CreatedBy: 'tranbon1',
    },
    {
      Id: 177033,
      MainOrderId: 55479,
      ItemId: '1060302986040',
      TitleOrigin: '终极火影疾风传终极之战潮玩公仔鸣人卡卡西盲盒潮玩儿童玩具手办',
      TitleTranslated:
        '[BonzStore] Mô Hình Naruto Shippuden Đại Chiến Nhẫn Giả Naruto & Kakashi Blindbox Chibi',
      Property: ';终极火影9款袋装',
      PropertyTranslated:
        'Bộ 9 mẫu Naruto Đại Chiến Nhẫn Giả Full Set (Đóng túi)',
      Quantity: 20,
      RealPrice: 65.0,
      PriceOrigin: 65.0,
      PricePromotion: 65.0,
      UPriceBuy: 65.0,
      UPriceBuyVN: 260650.0,
      PriceCNY: 65.0,
      PriceVND: 260650.0,
      TotalPriceVND: 260650.0,
      CurrentCNYVN: 4010.0,
      ImageOrigin:
        'https://cbu01.alicdn.com/img/ibank/O1CN01bPt2HA1hjPNZhVUad_!!2219358604313-0-cib.jpg',
      LinkOrigin:
        'https://detail.1688.com/offer/1060302986040.html?spm=a2615.pc_new_goods/2506.wp_pc_new_product_list.0',
      ShopId: '2219358604313',
      ShopName: '中山市源柯玩具商行（个体工商户）',
      Wangwang: '中山市源柯玩具商行（个体工商户）',
      Site: '1688',
      Stock: 632807,
      StepPrice: '',
      ProductStatusName: 'Còn hàng',
      StatusComplainName: 'Chưa khiếu nại',
      Created: '2026-10-07T09:10:34.7987646+07:00',
      CreatedBy: 'tranbon1',
    },
  ],
  PayOrderHistories: [
    {
      MainOrderId: 55479,
      UID: 6461,
      Status: 9,
      StatusName: 'Thanh toán',
      Amount: 2465876.0,
      Type: 1,
      TypeName: 'Trực tiếp',
      Id: 74261,
      Created: '2026-10-18T15:26:15.2637528+07:00',
      CreatedBy: 'KHOHN.BATU',
    },
    {
      MainOrderId: 55479,
      UID: 6176,
      Status: 2,
      StatusName: 'Đặt cọc',
      Amount: 7378400.0,
      Type: 2,
      TypeName: 'Ví điện tử',
      Id: 72865,
      Created: '2026-10-07T09:20:30.2865591+07:00',
      CreatedBy: 'tranbon1',
    },
  ],
  OrderComments: [
    {
      UID: 6176,
      MainOrderId: 55479,
      Comment:
        'https://hoabinhlogistics.com/Upload/6c66c476-4565-4906-9301-40912123529d-Screen%20Shot%202026-10-07%20at%2009.19.59.png',
      Type: 1,
      TypeName: 'Nhắn tin với khách',
      FileLink: '',
      Id: 54820,
      Created: '2026-10-07T09:20:26.1749861+07:00',
      CreatedBy: 'tranbon1',
    },
    {
      UID: 6176,
      MainOrderId: 55479,
      Comment: 'Free vận chuyển nội địa',
      Type: 1,
      TypeName: 'Nhắn tin với khách',
      FileLink: '',
      Id: 54817,
      Created: '2026-10-07T09:16:19.96418+07:00',
      CreatedBy: 'tranbon1',
    },
    {
      UID: 6176,
      MainOrderId: 55479,
      Comment:
        'https://hoabinhlogistics.com/Upload/f7f2d718-1225-4de8-ba5a-c638f0d60b44-Screen%20Shot%202026-10-07%20at%2009.15.33.png',
      Type: 1,
      TypeName: 'Nhắn tin với khách',
      FileLink: '',
      Id: 54816,
      Created: '2026-10-07T09:16:00.0140168+07:00',
      CreatedBy: 'tranbon1',
    },
  ],
};

const INITIAL_CASHBOOK_VOUCHERS: CashbookVoucherItem[] = [
  {
    id: 'cb-hb-72865',
    voucherCode: 'PC-HB72865',
    transactionDate: '2026-10-07T09:20:30.286+07:00',
    type: 'EXPENSE',
    category: 'Đặt cọc nhập hàng 1688',
    content:
      'Đặt cọc (80%) đơn hàng mua hộ #55479 — Shop 1688 中山市源柯玩具商行 (50 mô hình Kimetsu no Yaiba & Naruto Shippuden)',
    cashAmount: 0,
    cardAmount: 0,
    transferAmount: 7378400,
    totalAmount: 7378400,
    partnerName: 'Hoà Bình Logistics (Ví điện tử - Đơn #55479)',
    staffName: 'tranbon1 (bon)',
    importOrderId: 55479,
    externalPaymentId: 72865,
    note: 'Tự động đồng bộ từ PayOrderHistories #72865 (Loại: Ví điện tử / Chuyển khoản)',
    createdAt: '2026-10-07T09:20:30.286+07:00',
    updatedAt: '2026-10-07T09:20:30.286+07:00',
  },
  {
    id: 'cb-inc-1001',
    voucherCode: 'PT-202610-001',
    transactionDate: '2026-10-10T14:15:00.000+07:00',
    type: 'INCOME',
    category: 'Thu tiền bán hàng TikTok Shop',
    content:
      'Đối soát doanh thu tuần 1 tháng 10 — Đơn mô hình Hunter x Hunter Chibi Q-Ver & One Piece Luffy Gear 5',
    cashAmount: 0,
    cardAmount: 0,
    transferAmount: 6850000,
    totalAmount: 6850000,
    partnerName: 'TikTok Shop Seller Settlement VN',
    staffName: 'Admin BonzStore',
    importOrderId: null,
    externalPaymentId: null,
    note: 'Rút tiền đối soát tự động về tài khoản ngân hàng cửa hàng',
    createdAt: '2026-10-10T14:15:00.000+07:00',
    updatedAt: '2026-10-10T14:15:00.000+07:00',
  },
  {
    id: 'cb-inc-1002',
    voucherCode: 'PT-202610-002',
    transactionDate: '2026-10-14T18:30:00.000+07:00',
    type: 'INCOME',
    category: 'Thu tiền cọc Pre-order khách lẻ',
    content:
      'Khách đặt cọc trước lô mô hình Naruto Đại Chiến Nhẫn Giả (9 mẫu) & Kimetsu Dáng Ngủ thuộc đơn #55479',
    cashAmount: 1200000,
    cardAmount: 2450000,
    transferAmount: 1850000,
    totalAmount: 5500000,
    partnerName: 'Nguyễn Minh Quân & 6 Khách Otaku Pre-order',
    staffName: 'Quản lý Cửa hàng',
    importOrderId: 55479,
    externalPaymentId: null,
    note: 'Thu tiền mặt tại quầy Q7 + Quẹt thẻ POS Visa + Chuyển khoản QR',
    createdAt: '2026-10-14T18:30:00.000+07:00',
    updatedAt: '2026-10-14T18:30:00.000+07:00',
  },
  {
    id: 'cb-hb-74261',
    voucherCode: 'PC-HB74261',
    transactionDate: '2026-10-18T15:26:15.263+07:00',
    type: 'EXPENSE',
    category: 'Tất toán & Cước vận chuyển TQ-VN',
    content:
      'Thanh toán tất toán đơn #55479 khi nhận 3 kiện hàng (34.04kg — Bao K910-118) tại kho HCM: Phần thiếu tiền hàng + Phí mua hộ (110.676₫) + Cước cân nặng (510.600₫)',
    cashAmount: 2465876,
    cardAmount: 0,
    transferAmount: 0,
    totalAmount: 2465876,
    partnerName: 'Kho Hoà Bình Logistics (KHOHN.BATU - Đơn #55479)',
    staffName: 'tranbon1 (bon)',
    importOrderId: 55479,
    externalPaymentId: 74261,
    note: 'Tự động đồng bộ từ PayOrderHistories #74261 (Loại: Trực tiếp / Tiền mặt)',
    createdAt: '2026-10-18T15:26:15.263+07:00',
    updatedAt: '2026-10-18T15:26:15.263+07:00',
  },
  {
    id: 'cb-exp-1003',
    voucherCode: 'PC-202610-003',
    transactionDate: '2026-10-19T10:00:00.000+07:00',
    type: 'EXPENSE',
    category: 'Chi phí đóng gói & Vận hành kho',
    content:
      'Mua thùng carton 3 lớp, xốp nổ chống sốc và băng keo in logo BonzStore phục vụ đóng đơn lô hàng #55479',
    cashAmount: 450000,
    cardAmount: 680000,
    transferAmount: 0,
    totalAmount: 1130000,
    partnerName: 'Bao Bì Đóng Gói Nam Phát Q7',
    staffName: 'Nhân viên Anime #01',
    importOrderId: 55479,
    externalPaymentId: null,
    note: 'Thanh toán tiền mặt + thẻ công ty',
    createdAt: '2026-10-19T10:00:00.000+07:00',
    updatedAt: '2026-10-19T10:00:00.000+07:00',
  },
  {
    id: 'cb-inc-1004',
    voucherCode: 'PT-202610-004',
    transactionDate: '2026-10-21T16:40:00.000+07:00',
    type: 'INCOME',
    category: 'Thu tiền bán lẻ tại Showroom & Online',
    content:
      'Bán lẻ 12 bộ Naruto Shippuden Đại Chiến Nhẫn Giả (6 mẫu & 9 mẫu) và 5 bộ Kimetsu Dáng Ngủ sau khi nhập kho đơn #55479',
    cashAmount: 2680000,
    cardAmount: 3120000,
    transferAmount: 4490000,
    totalAmount: 10290000,
    partnerName: 'Khách mua lẻ Showroom Quận 7 & Đơn COD',
    staffName: 'tranbon1 (bon)',
    importOrderId: 55479,
    externalPaymentId: null,
    note: 'Doanh thu trực tiếp từ lô hàng nhập #55479',
    createdAt: '2026-10-21T16:40:00.000+07:00',
    updatedAt: '2026-10-21T16:40:00.000+07:00',
  },
  {
    id: 'cb-inc-1005',
    voucherCode: 'PT-202610-005',
    transactionDate: '2026-10-24T11:20:00.000+07:00',
    type: 'INCOME',
    category: 'Thu tiền bán hàng TikTok Shop',
    content:
      'Thanh toán đơn hàng TikTok Shop chiến dịch Flash Sale Cuối Tháng (Naruto & Kimetsu Blindbox)',
    cashAmount: 0,
    cardAmount: 1580000,
    transferAmount: 5920000,
    totalAmount: 7500000,
    partnerName: 'TikTok Shop Seller Settlement VN',
    staffName: 'Admin BonzStore',
    importOrderId: 55479,
    externalPaymentId: null,
    note: 'Đã đối soát hoàn tất',
    createdAt: '2026-10-24T11:20:00.000+07:00',
    updatedAt: '2026-10-24T11:20:00.000+07:00',
  },
];

const LS_CASHBOOK_KEY = 'bonzstore_local_cashbook_v1';
const LS_OPENING_KEY = 'bonzstore_local_opening_v1';

function getStoredOpening() {
  try {
    const raw = localStorage.getItem(LS_OPENING_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { cash: 5000000, card: 3500000, transfer: 16500000, total: 25000000 };
}

function getStoredVouchers(): CashbookVoucherItem[] {
  try {
    const raw = localStorage.getItem(LS_CASHBOOK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  localStorage.setItem(
    LS_CASHBOOK_KEY,
    JSON.stringify(INITIAL_CASHBOOK_VOUCHERS),
  );
  return [...INITIAL_CASHBOOK_VOUCHERS];
}

export function computeLocalCashbookSummary(
  vouchers: CashbookVoucherItem[],
): CashbookSummaryReport {
  const opening = getStoredOpening();
  let incomeCash = 0;
  let incomeCard = 0;
  let incomeTransfer = 0;
  let expenseCash = 0;
  let expenseCard = 0;
  let expenseTransfer = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const v of vouchers) {
    if (v.type === 'INCOME') {
      incomeCount += 1;
      incomeCash += Number(v.cashAmount || 0);
      incomeCard += Number(v.cardAmount || 0);
      incomeTransfer += Number(v.transferAmount || 0);
    } else {
      expenseCount += 1;
      expenseCash += Number(v.cashAmount || 0);
      expenseCard += Number(v.cardAmount || 0);
      expenseTransfer += Number(v.transferAmount || 0);
    }
  }

  const totalIncome = {
    cash: incomeCash,
    card: incomeCard,
    transfer: incomeTransfer,
    total: incomeCash + incomeCard + incomeTransfer,
  };
  const totalExpense = {
    cash: expenseCash,
    card: expenseCard,
    transfer: expenseTransfer,
    total: expenseCash + expenseCard + expenseTransfer,
  };

  return {
    openingBalance: opening,
    totalIncome,
    totalExpense,
    closingBalance: {
      cash: opening.cash + totalIncome.cash - totalExpense.cash,
      card: opening.card + totalIncome.card - totalExpense.card,
      transfer: opening.transfer + totalIncome.transfer - totalExpense.transfer,
      total: opening.total + totalIncome.total - totalExpense.total,
    },
    voucherCounts: {
      total: vouchers.length,
      incomeCount,
      expenseCount,
    },
  };
}

const LS_IMPORT_TOKEN_KEY = 'bonzstore_hoabinh_token_config_v2';
const LS_IMPORT_ORDERS_KEY = 'bonzstore_hoabinh_orders_v2';

function maskTokenStr(token: string): string {
  const clean = (token || '').trim().replace(/^Bearer\s+/i, '');
  if (!clean) return '';
  if (clean.length <= 16) return `Bearer ${clean.slice(0, 6)}...`;
  return `Bearer ${clean.slice(0, 14)}...${clean.slice(-8)}`;
}

export function getStoredImportTokenConfig(): ImportTokenConfig {
  try {
    const raw = localStorage.getItem(LS_IMPORT_TOKEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const decoded = decodeHoabinhJwt(HOABINH_REAL_JWT_TOKEN);
  const initialConfig: ImportTokenConfig = {
    token: HOABINH_REAL_JWT_TOKEN,
    maskedToken: maskTokenStr(HOABINH_REAL_JWT_TOKEN),
    accountUsername: `${decoded.userData.UserName} (UID: ${decoded.userData.UserId})`,
    uid: decoded.userData.UserId,
    userGroupId: decoded.userData.UserGroupId,
    isCheckOTP: decoded.userData.IsCheckOTP,
    isConfirmOTP: decoded.userData.IsConfirmOTP,
    tokenExp: decoded.exp,
    isExpired: false,
    isLinked: true,
    loginUrl: 'https://hoabinhlogistics.com',
    authApiUrl: 'https://hoabinhlogistics.com/api/authenticate/login',
    apiBaseUrl: 'https://hoabinhlogistics.com/api/main-order',
    updatedAt: new Date().toISOString(),
    hasToken: true,
  };
  try {
    localStorage.setItem(LS_IMPORT_TOKEN_KEY, JSON.stringify(initialConfig));
  } catch {
    // ignore
  }
  return initialConfig;
}

export function saveStoredImportTokenConfig(
  token: string,
  accountUsername?: string,
): ImportTokenConfig {
  const clean = (token || '').trim().replace(/^Bearer\s+/i, '') || HOABINH_REAL_JWT_TOKEN;
  const decoded = decodeHoabinhJwt(clean);
  const next: ImportTokenConfig = {
    token: clean,
    maskedToken: maskTokenStr(clean),
    accountUsername:
      accountUsername?.trim() ||
      `${decoded.userData.UserName} (UID: ${decoded.userData.UserId})`,
    uid: decoded.userData.UserId || 6176,
    userGroupId: decoded.userData.UserGroupId || 2,
    isCheckOTP: decoded.userData.IsCheckOTP,
    isConfirmOTP: decoded.userData.IsConfirmOTP,
    tokenExp: decoded.exp,
    isExpired: false,
    isLinked: true,
    loginUrl: 'https://hoabinhlogistics.com',
    authApiUrl: 'https://hoabinhlogistics.com/api/authenticate/login',
    apiBaseUrl: 'https://hoabinhlogistics.com/api/main-order',
    updatedAt: new Date().toISOString(),
    hasToken: true,
  };
  try {
    localStorage.setItem(LS_IMPORT_TOKEN_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function simulateLocalTokenExpired401(): ImportTokenConfig {
  const current = getStoredImportTokenConfig();
  const expiredConfig: ImportTokenConfig = {
    ...current,
    isExpired: true,
    isLinked: false,
    hasToken: false,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(LS_IMPORT_TOKEN_KEY, JSON.stringify(expiredConfig));
  } catch {
    // ignore
  }
  return expiredConfig;
}

export function loginHoabinhFallback(
  payload: HoabinhLoginPayload,
): HoabinhLoginResponse {
  const tokenToUse =
    payload.customToken?.trim().replace(/^Bearer\s+/i, '') ||
    HOABINH_REAL_JWT_TOKEN;
  const decoded = decodeHoabinhJwt(tokenToUse);
  if (payload.userName?.trim()) {
    decoded.userData.UserName = payload.userName.trim();
  }
  const tokenConfig = saveStoredImportTokenConfig(
    tokenToUse,
    `${decoded.userData.UserName} (UID: ${decoded.userData.UserId})`,
  );
  return {
    Success: true,
    Data: {
      token: tokenToUse,
    },
    ResultCode: 200,
    ResultMessage: null,
    decoded,
    tokenConfig,
  };
}

function createInitialMultiTabOrders(): StoredImportOrderRecord[] {
  const order55479Current: StoredImportOrderRecord = {
    id: 55479,
    orderCode: '5127805405728007936',
    sourceUrl: 'https://hoabinhlogistics.com/api/main-order/55479',
    workflowTab: 'CURRENT',
    orderTypeParam: 1,
    approvedAt: '2026-10-22T00:57:47.72+07:00',
    approvedBy: 'tranbon1 (bon)',
    syncedToCatalog: true,
    syncedToCashbook: true,
    lastSyncedAt: '2026-10-22T00:57:47.72+07:00',
    syncedProductIds: ['1073254875055', '1060302986040'],
    rawData: JSON.parse(JSON.stringify(HOABINH_ORDER_55479_DATA)),
  };

  // Đơn thứ 2 ở Tab Hiện tại (OrderType=1): Đơn #55482 đang vận chuyển TQ -> HCM
  const raw55482: HoabinhMainOrderData = {
    ...JSON.parse(JSON.stringify(HOABINH_ORDER_55479_DATA)),
    Id: 55482,
    UID: 6176,
    Status: 7,
    StatusName: 'Đang về kho đích (HCM)',
    OrderType: 1,
    OrderTypeName: 'Đơn hàng mua hộ',
    TotalPriceVND: 6450000,
    TotalOrderAmount: 6450000,
    AmountDeposit: 5160000,
    Deposit: 5160000,
    RemainingAmount: 1290000,
    PriceVND: 6015000,
    PriceCNY: 1500,
    TotalPriceReal: 6015000,
    TotalPriceRealCNY: 1500,
    FeeBuyPro: 90000,
    FeeWeight: 345000,
    OrderWeight: 23.0,
    TQVNWeight: 23.0,
    ShopName: '东莞市漫魂动漫玩具有限公司',
    Created: '2026-10-25T09:15:00.000+07:00',
    MainOrderCodes: [
      {
        MainOrderID: 55482,
        Code: '5129940182736190012',
        OrderTransactionCode: ['YT74829100421', 'YT74829100422'],
        RowNumber: 0,
        Id: 38110,
        Created: '2026-10-25T10:20:00.000+07:00',
        CreatedBy: 'dhkimlien',
      },
    ],
  };

  const order55482Current: StoredImportOrderRecord = {
    id: 55482,
    orderCode: '5129940182736190012',
    sourceUrl: 'https://hoabinhlogistics.com/api/main-order/55482',
    workflowTab: 'CURRENT',
    orderTypeParam: 1,
    approvedAt: null,
    approvedBy: null,
    syncedToCatalog: false,
    syncedToCashbook: false,
    lastSyncedAt: '2026-10-25T10:20:00.000+07:00',
    syncedProductIds: [],
    rawData: raw55482,
  };

  // Đơn ở Tab Bản nháp (OrderType=0): Đơn #55485 đang lên đơn nháp chờ duyệt
  const raw55485Draft: HoabinhMainOrderData = {
    ...JSON.parse(JSON.stringify(HOABINH_ORDER_55479_DATA)),
    Id: 55485,
    UID: 6176,
    Status: 0,
    StatusName: 'Bản nháp (Chờ duyệt đặt cọc)',
    OrderType: 0,
    OrderTypeName: 'Đơn hàng bản nháp',
    TotalPriceVND: 4812000,
    TotalOrderAmount: 4812000,
    AmountDeposit: 3849600,
    Deposit: 0,
    RemainingAmount: 4812000,
    PriceVND: 4411000,
    PriceCNY: 1100,
    TotalPriceReal: 4411000,
    TotalPriceRealCNY: 1100,
    FeeBuyPro: 66000,
    FeeWeight: 335000,
    OrderWeight: 14.5,
    TQVNWeight: 14.5,
    ShopName: '广州市番禺区动漫周边手办厂',
    Created: '2026-10-28T14:30:00.000+07:00',
    MainOrderCodes: [
      {
        MainOrderID: 55485,
        Code: 'DRAFT-1688-55485',
        OrderTransactionCode: ['CHUA_PHAT_HANH'],
        RowNumber: 0,
        Id: 38199,
        Created: '2026-10-28T14:30:00.000+07:00',
        CreatedBy: 'tranbon1',
      },
    ],
  };

  const order55485Draft: StoredImportOrderRecord = {
    id: 55485,
    orderCode: 'DRAFT-1688-55485',
    sourceUrl: 'https://hoabinhlogistics.com/api/main-order/55485',
    workflowTab: 'DRAFT',
    orderTypeParam: 0,
    approvedAt: null,
    approvedBy: null,
    syncedToCatalog: false,
    syncedToCashbook: false,
    lastSyncedAt: '2026-10-28T14:30:00.000+07:00',
    syncedProductIds: [],
    rawData: raw55485Draft,
  };

  // Đơn ở Tab Đã duyệt (OrderType=2): Bản đã duyệt nhập kho chính thức của #55479
  const raw55479Approved: HoabinhMainOrderData = {
    ...JSON.parse(JSON.stringify(HOABINH_ORDER_55479_DATA)),
    OrderType: 2,
    OrderTypeName: 'Đơn hàng đã duyệt & Nhập kho',
  };

  const order55479Approved: StoredImportOrderRecord = {
    id: 55479,
    orderCode: '5127805405728007936',
    sourceUrl: 'https://hoabinhlogistics.com/api/main-order/55479',
    workflowTab: 'APPROVED',
    orderTypeParam: 2,
    approvedAt: '2026-10-22T00:57:47.72+07:00',
    approvedBy: 'tranbon1 (bon)',
    syncedToCatalog: true,
    syncedToCashbook: true,
    lastSyncedAt: '2026-10-22T00:57:47.72+07:00',
    syncedProductIds: ['1073254875055', '1060302986040'],
    rawData: raw55479Approved,
  };

  return [
    order55479Current,
    order55482Current,
    order55485Draft,
    order55479Approved,
  ];
}

function getStoredImportOrdersList(): StoredImportOrderRecord[] {
  try {
    const raw = localStorage.getItem(LS_IMPORT_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const initial = createInitialMultiTabOrders();
  try {
    localStorage.setItem(LS_IMPORT_ORDERS_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }
  return initial;
}

export function updateLocalOrderWorkflowTab(
  orderId: number,
  targetTab: ImportOrderTabType,
): StoredImportOrderRecord[] {
  const list = getStoredImportOrdersList();
  const orderTypeMap: Record<ImportOrderTabType, number> = {
    CURRENT: 1,
    DRAFT: 0,
    APPROVED: 2,
  };
  const statusMap: Record<
    ImportOrderTabType,
    { status: number; statusName: string; orderTypeName: string }
  > = {
    CURRENT: {
      status: 14,
      statusName: 'Đã hoàn thành',
      orderTypeName: 'Đơn hàng mua hộ',
    },
    DRAFT: {
      status: 0,
      statusName: 'Bản nháp (Chờ duyệt)',
      orderTypeName: 'Đơn hàng bản nháp',
    },
    APPROVED: {
      status: 14,
      statusName: 'Đã duyệt & Đồng bộ kho',
      orderTypeName: 'Đơn hàng đã duyệt',
    },
  };

  const sourceRecord =
    list.find((r) => r.id === orderId) || createInitialMultiTabOrders()[0];

  // Kiểm tra nếu đã có bản ghi cùng id ở tab đích thì cập nhật, nếu chưa có thì chuyển/sao lưu
  const updated = list.filter(
    (r) => !(r.id === orderId && r.workflowTab !== targetTab && orderId !== 55479),
  );
  const existingInTargetIdx = updated.findIndex(
    (r) => r.id === orderId && r.workflowTab === targetTab,
  );

  const nextRecord: StoredImportOrderRecord = {
    ...JSON.parse(JSON.stringify(sourceRecord)),
    workflowTab: targetTab,
    orderTypeParam: orderTypeMap[targetTab],
    approvedAt: targetTab === 'APPROVED' ? new Date().toISOString() : null,
    approvedBy: targetTab === 'APPROVED' ? 'tranbon1 (bon)' : null,
    syncedToCatalog: targetTab === 'APPROVED' ? true : sourceRecord.syncedToCatalog,
    syncedToCashbook:
      targetTab === 'APPROVED' ? true : sourceRecord.syncedToCashbook,
    lastSyncedAt: new Date().toISOString(),
    rawData: {
      ...JSON.parse(JSON.stringify(sourceRecord.rawData)),
      OrderType: orderTypeMap[targetTab],
      OrderTypeName: statusMap[targetTab].orderTypeName,
      Status:
        orderId === 55479 && targetTab === 'CURRENT'
          ? 14
          : statusMap[targetTab].status,
      StatusName:
        orderId === 55479 && targetTab === 'CURRENT'
          ? 'Đã hoàn thành'
          : statusMap[targetTab].statusName,
    },
  };

  if (existingInTargetIdx >= 0) {
    updated[existingInTargetIdx] = nextRecord;
  } else {
    updated.unshift(nextRecord);
  }

  try {
    localStorage.setItem(LS_IMPORT_ORDERS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function getFallbackImportsPaginated(
  params?: Record<string, any>,
): ImportOrdersPaginatedResponse {
  const allRecords = getStoredImportOrdersList();
  const tokenConfig = getStoredImportTokenConfig();

  const tab: ImportOrderTabType =
    params?.tab === 'DRAFT' || Number(params?.OrderType) === 0
      ? 'DRAFT'
      : params?.tab === 'APPROVED' || Number(params?.OrderType) === 2
        ? 'APPROVED'
        : 'CURRENT';

  const orderType = tab === 'DRAFT' ? 0 : tab === 'APPROVED' ? 2 : 1;
  const uid = Number(params?.UID || tokenConfig.uid || 6176);
  const pageIndex = Math.max(1, Number(params?.PageIndex || params?.page || 1));
  const pageSize = Math.max(
    1,
    Number(params?.PageSize || params?.limit || 20),
  );
  const orderBy = String(params?.OrderBy || 'Id desc');

  const currentTabCount = allRecords.filter(
    (r) => (r.workflowTab || 'CURRENT') === 'CURRENT',
  ).length;
  const draftTabCount = allRecords.filter(
    (r) => r.workflowTab === 'DRAFT',
  ).length;
  const approvedTabCount = allRecords.filter(
    (r) => r.workflowTab === 'APPROVED',
  ).length;

  let filtered = allRecords.filter(
    (r) => (r.workflowTab || 'CURRENT') === tab,
  );

  if (params?.status && params.status !== 'ALL') {
    filtered = filtered.filter(
      (r) =>
        String(r.rawData.Status) === String(params.status) ||
        r.rawData.StatusName === params.status,
    );
  }

  if (params?.search) {
    const q = String(params.search).trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((r) => {
        const d = r.rawData;
        return (
          String(d.Id).includes(q) ||
          r.orderCode.toLowerCase().includes(q) ||
          (d.ShopName || '').toLowerCase().includes(q) ||
          (d.UserName || '').toLowerCase().includes(q) ||
          (d.SmallPackages || []).some((p) =>
            (p.OrderTransactionCode || '').toLowerCase().includes(q),
          ) ||
          (d.Orders || []).some(
            (it) =>
              (it.TitleOrigin || '').toLowerCase().includes(q) ||
              (it.TitleTranslated || '').toLowerCase().includes(q) ||
              (it.ItemId || '').toLowerCase().includes(q),
          )
        );
      });
    }
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(pageIndex, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagedData = filtered.slice(start, start + pageSize);

  const stats: ImportOrderStats = {
    totalOrders: currentTabCount,
    currentTabCount,
    draftTabCount,
    approvedTabCount,
    totalImportValueVND: 9844276,
    totalImportValueCNY: 2300,
    totalDepositPaidVND: 9844276,
    totalRemainingVND: 0,
    totalWeightKg: 34.04,
    totalSmallPackages: 4,
    totalItemsQuantity: 50,
    totalUniqueItems: 3,
    hasActiveToken: tokenConfig.hasToken && !tokenConfig.isExpired,
    maskedToken: tokenConfig.maskedToken,
  };

  return {
    data: pagedData,
    stats,
    tokenConfig,
    requestInspector: {
      method: 'GET',
      requestUrl: `https://hoabinhlogistics.com/api/main-order?OrderBy=${encodeURIComponent(orderBy).replace(/%20/g, '+')}&PageIndex=${safePage}&PageSize=${pageSize}&UID=${uid}&OrderType=${orderType}`,
      orderBy,
      pageIndex: safePage,
      pageSize,
      uid,
      orderType,
      tab,
    },
    meta: {
      page: safePage,
      limit: pageSize,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

export function getFallbackCashbookPaginated(
  params?: Record<string, any>,
): CashbookPaginatedResponse {
  let list = getStoredVouchers();
  if (params?.type && params.type !== 'ALL') {
    list = list.filter((v) => v.type === params.type);
  }
  if (params?.paymentChannel && params.paymentChannel !== 'ALL') {
    if (params.paymentChannel === 'CASH')
      list = list.filter((v) => v.cashAmount > 0);
    if (params.paymentChannel === 'CARD')
      list = list.filter((v) => v.cardAmount > 0);
    if (params.paymentChannel === 'TRANSFER')
      list = list.filter((v) => v.transferAmount > 0);
  }
  if (params?.category && params.category !== 'ALL') {
    list = list.filter((v) => v.category === params.category);
  }
  if (params?.search) {
    const q = String(params.search).toLowerCase();
    list = list.filter(
      (v) =>
        v.voucherCode.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.content.toLowerCase().includes(q) ||
        v.partnerName.toLowerCase().includes(q) ||
        v.staffName.toLowerCase().includes(q),
    );
  }

  const summary = computeLocalCashbookSummary(list);
  const page = Math.max(1, Number(params?.page || 1));
  const limit = Math.max(1, Number(params?.limit || 10));
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    data: list.slice(start, start + limit),
    summary,
    categories: Array.from(
      new Set(getStoredVouchers().map((v) => v.category)),
    ),
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function createLocalCashbookVoucher(
  payload: CreateCashbookVoucherPayload,
) {
  const list = getStoredVouchers();
  const cashAmount = Math.max(0, Number(payload.cashAmount || 0));
  const cardAmount = Math.max(0, Number(payload.cardAmount || 0));
  const transferAmount = Math.max(0, Number(payload.transferAmount || 0));
  const totalAmount = cashAmount + cardAmount + transferAmount;
  const prefix = payload.type === 'INCOME' ? 'PT' : 'PC';
  const voucherCode =
    payload.voucherCode?.trim() ||
    `${prefix}-202610-${String(list.length + 1).padStart(3, '0')}`;

  const item: CashbookVoucherItem = {
    id: `cb-local-${Date.now()}`,
    voucherCode,
    transactionDate: payload.transactionDate || new Date().toISOString(),
    type: payload.type,
    category: payload.category,
    content: payload.content,
    cashAmount,
    cardAmount,
    transferAmount,
    totalAmount,
    partnerName: payload.partnerName,
    staffName: payload.staffName || 'tranbon1 (bon)',
    importOrderId: payload.importOrderId ?? 55479,
    externalPaymentId: null,
    note: payload.note || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const next = [item, ...list];
  localStorage.setItem(LS_CASHBOOK_KEY, JSON.stringify(next));
  return { voucher: item, summary: computeLocalCashbookSummary(next) };
}

export function updateLocalCashbookVoucher(
  id: string,
  payload: Partial<CreateCashbookVoucherPayload>,
) {
  const list = getStoredVouchers();
  const idx = list.findIndex((v) => v.id === id);
  if (idx >= 0) {
    const old = list[idx];
    const cashAmount =
      payload.cashAmount !== undefined ? Number(payload.cashAmount) : old.cashAmount;
    const cardAmount =
      payload.cardAmount !== undefined ? Number(payload.cardAmount) : old.cardAmount;
    const transferAmount =
      payload.transferAmount !== undefined
        ? Number(payload.transferAmount)
        : old.transferAmount;
    list[idx] = {
      ...old,
      ...payload,
      cashAmount,
      cardAmount,
      transferAmount,
      totalAmount: cashAmount + cardAmount + transferAmount,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LS_CASHBOOK_KEY, JSON.stringify(list));
  }
  return { summary: computeLocalCashbookSummary(list) };
}

export function deleteLocalCashbookVoucher(id: string) {
  const list = getStoredVouchers().filter((v) => v.id !== id);
  localStorage.setItem(LS_CASHBOOK_KEY, JSON.stringify(list));
  return { deletedId: id, summary: computeLocalCashbookSummary(list) };
}

export function updateLocalOpeningBalance(data: {
  cash: number;
  card: number;
  transfer: number;
}) {
  const next = {
    cash: Number(data.cash || 0),
    card: Number(data.card || 0),
    transfer: Number(data.transfer || 0),
    total:
      Number(data.cash || 0) +
      Number(data.card || 0) +
      Number(data.transfer || 0),
  };
  localStorage.setItem(LS_OPENING_KEY, JSON.stringify(next));
  return computeLocalCashbookSummary(getStoredVouchers());
}

export function restoreLocalAllData() {
  saveStoredImportTokenConfig(HOABINH_REAL_JWT_TOKEN, 'tranbon1 (UID: 6176)');
  localStorage.setItem(
    LS_IMPORT_ORDERS_KEY,
    JSON.stringify(createInitialMultiTabOrders()),
  );
  localStorage.setItem(
    LS_CASHBOOK_KEY,
    JSON.stringify(INITIAL_CASHBOOK_VOUCHERS),
  );
  localStorage.setItem(
    LS_OPENING_KEY,
    JSON.stringify({
      cash: 5000000,
      card: 3500000,
      transfer: 16500000,
      total: 25000000,
    }),
  );
  return {
    restored: true,
    message:
      'Đã khôi phục (Restore) đầy đủ dữ liệu đơn nhập hàng #55479 (3 Tabs: Hiện tại, Bản nháp, Đã duyệt) và Sổ Quỹ Thu/Chi',
    orderId: 55479,
    syncedProductsCount: 2,
    syncedSkusCount: 3,
    summary: computeLocalCashbookSummary(INITIAL_CASHBOOK_VOUCHERS),
    totalVouchers: INITIAL_CASHBOOK_VOUCHERS.length,
  };
}

export function getFallbackChartsAnalytics(): CashbookChartsAnalyticsResponse {
  const vouchers = getStoredVouchers();
  const summary = computeLocalCashbookSummary(vouchers);

  const sorted = [...vouchers].sort(
    (a, b) =>
      new Date(a.transactionDate).getTime() -
      new Date(b.transactionDate).getTime(),
  );
  const dateMap = new Map<string, any>();
  for (const v of sorted) {
    const dayKey = v.transactionDate.slice(0, 10);
    const curr = dateMap.get(dayKey) || {
      date: dayKey,
      income: 0,
      expense: 0,
      incomeCash: 0,
      incomeCard: 0,
      incomeTransfer: 0,
      expenseCash: 0,
      expenseCard: 0,
      expenseTransfer: 0,
      voucherCount: 0,
    };
    if (v.type === 'INCOME') {
      curr.income += v.totalAmount;
      curr.incomeCash += v.cashAmount;
      curr.incomeCard += v.cardAmount;
      curr.incomeTransfer += v.transferAmount;
    } else {
      curr.expense += v.totalAmount;
      curr.expenseCash += v.cashAmount;
      curr.expenseCard += v.cardAmount;
      curr.expenseTransfer += v.transferAmount;
    }
    curr.voucherCount += 1;
    dateMap.set(dayKey, curr);
  }

  let running = summary.openingBalance.total;
  const timelineSeries = Array.from(dateMap.values()).map((pt) => {
    running = running + pt.income - pt.expense;
    return {
      ...pt,
      netFlow: pt.income - pt.expense,
      closingBalance: running,
    };
  });

  const incMap = new Map<string, number>();
  const expMap = new Map<string, number>();
  for (const v of vouchers) {
    if (v.type === 'INCOME') {
      incMap.set(v.category, (incMap.get(v.category) || 0) + v.totalAmount);
    } else {
      expMap.set(v.category, (expMap.get(v.category) || 0) + v.totalAmount);
    }
  }

  return {
    summary,
    timelineSeries,
    paymentChannels: [
      {
        channel: 'CASH',
        labelVi: 'Tiền mặt',
        labelEn: 'Cash',
        opening: summary.openingBalance.cash,
        income: summary.totalIncome.cash,
        expense: summary.totalExpense.cash,
        closing: summary.closingBalance.cash,
      },
      {
        channel: 'CARD',
        labelVi: 'Thẻ (POS / Visa)',
        labelEn: 'Card (POS / Visa)',
        opening: summary.openingBalance.card,
        income: summary.totalIncome.card,
        expense: summary.totalExpense.card,
        closing: summary.closingBalance.card,
      },
      {
        channel: 'TRANSFER',
        labelVi: 'Chuyển khoản / Ví điện tử',
        labelEn: 'Bank Transfer / E-Wallet',
        opening: summary.openingBalance.transfer,
        income: summary.totalIncome.transfer,
        expense: summary.totalExpense.transfer,
        closing: summary.closingBalance.transfer,
      },
    ],
    incomeByCategory: Array.from(incMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage:
        summary.totalIncome.total > 0
          ? Number(((amount / summary.totalIncome.total) * 100).toFixed(1))
          : 0,
    })),
    expenseByCategory: Array.from(expMap.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage:
          summary.totalExpense.total > 0
            ? Number(((amount / summary.totalExpense.total) * 100).toFixed(1))
            : 0,
      }),
    ),
    order55479Analytics: {
      orderId: 55479,
      shopName: '中山市源柯玩具商行（个体工商户）',
      site: '1688',
      exchangeRate: 4010,
      totalPriceCNY: 2300,
      productCostVND: 9223000,
      buyingFeeVND: 110676,
      weightFeeVND: 510600,
      totalImportCostVND: 9844276,
      depositPaidVND: 7378400,
      finalPaymentVND: 2465876,
      totalWeightKg: 34.04,
      totalQuantity: 50,
      recordedRevenueVND: 23290000,
      recordedExpenseVND: 10974276,
      netProfitToDateVND: 13445724,
      costBreakdown: [
        {
          labelVi: 'Tiền hàng gốc 1688 (2.300¥ × 4.010₫)',
          labelEn: '1688 Merchandise Cost (2,300 CNY)',
          amount: 9223000,
          percent: 93.69,
        },
        {
          labelVi: 'Cước cân nặng TQ-VN (34.04kg × 15.000₫)',
          labelEn: 'CN-VN Weight Shipping Fee (34.04kg)',
          amount: 510600,
          percent: 5.19,
        },
        {
          labelVi: 'Phí dịch vụ mua hộ (27.6¥)',
          labelEn: 'Buying Service Fee (27.6 CNY)',
          amount: 110676,
          percent: 1.12,
        },
      ],
      packagesBreakdown: [
        {
          packageId: 495282,
          trackingCode: '50028196897700030003',
          weightKg: 18.86,
          feeVND: 282900,
          statusName: 'Đã giao khách hàng',
        },
        {
          packageId: 495283,
          trackingCode: '50028196897700030002',
          weightKg: 12.78,
          feeVND: 191700,
          statusName: 'Đã giao khách hàng',
        },
        {
          packageId: 495286,
          trackingCode: '50028196897700030001',
          weightKg: 2.4,
          feeVND: 36000,
          statusName: 'Đã giao khách hàng',
        },
        {
          packageId: 495068,
          trackingCode: '500281968977',
          weightKg: 0,
          feeVND: 0,
          statusName: 'Chưa về kho TQ (Mã tổng 3k)',
        },
      ],
      itemsBreakdown: [
        {
          itemId: '1073254875055',
          rowId: 177035,
          nameVi: 'Mô hình Kimetsu no Yaiba Dáng Ngủ (8 mẫu túi)',
          property: ';被窝睡眠鬼灭8款（袋装）',
          quantity: 10,
          unitPriceCNY: 14,
          unitPriceVND: 56140,
          totalCNY: 140,
          totalVND: 561400,
        },
        {
          itemId: '1060302986040',
          rowId: 177034,
          nameVi: 'Mô hình Naruto Đại Chiến Nhẫn Giả (6 mẫu túi)',
          property: ';6款终极火影袋装',
          quantity: 20,
          unitPriceCNY: 43,
          unitPriceVND: 172430,
          totalCNY: 860,
          totalVND: 3448600,
        },
        {
          itemId: '1060302986040',
          rowId: 177033,
          nameVi: 'Mô hình Naruto Đại Chiến Nhẫn Giả (9 mẫu túi)',
          property: ';终极火影9款袋装',
          quantity: 20,
          unitPriceCNY: 65,
          unitPriceVND: 260650,
          totalCNY: 1300,
          totalVND: 5213000,
        },
      ],
    },
  };
}

