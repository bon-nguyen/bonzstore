export interface HoabinhMainOrderCode {
  MainOrderID: number;
  Code: string;
  OrderTransactionCode: string[];
  RowNumber: number;
  Id: number;
  Created: string;
  CreatedBy: string;
  Updated: string | null;
  UpdatedBy: string | null;
  Deleted: boolean;
  Active: boolean;
}

export interface HoabinhSmallPackage {
  CskhName: string | null;
  UserAddress: string | null;
  MainOrderDepositDate: string | null;
  TypePaymentWeight: number;
  ExpectedDeliveryDate: string | null;
  Quantity: number | null;
  ShippingName: string | null;
  WarehouseName: string | null;
  IsHCM: number;
  TotalMustPay: number | null;
  WorkingSessionId: number | null;
  BackToVNBy: string | null;
  DateBackToVN: string | null;
  DateWaitHCM: string | null;
  WaitHCMBy: string | null;
  DateGoingHCM: string | null;
  GoingHCMBy: string | null;
  VolumePayment: number;
  PriceVolume: number;
  IsPayment: boolean;
  UID: number;
  MainOrderId: number;
  BigPackageId: number | null;
  BigPackageName: string | null;
  MainOrderCodeId: number;
  TransportationOrderId: number | null;
  MainOrderCode: string;
  OrderTransactionCode: string;
  ProductType: string | null;
  Weight: number;
  Volume: number;
  PayableWeight: number;
  Status: number;
  StatusName: string;
  Description: string;
  Length: number | null;
  Height: number | null;
  Width: number | null;
  LWH: string;
  FloatingStatus: number;
  FloatingStatusName: string;
  StaffNoteCheck: string | null;
  FloatingUserName: string;
  FloatingUserPhone: string;
  FeeShip: number;
  UserNote: string | null;
  TotalPrice: number;
  DateInTQWarehouse: string | null;
  StaffTQWarehouse: string;
  DateScanTQ: string | null;
  DateScanVN: string | null;
  TotalOrder: number;
  TotalOrderQuantity: number;
  TotalStatus0: number;
  TotalStatus1: number;
  TotalStatus2: number;
  TotalStatus3: number;
  TotalStatus4: number;
  OrderType: number;
  OrderTypeName: string;
  Code: string;
  IsCheckProduct: boolean;
  IsPackged: boolean;
  IsInsurance: boolean;
  DateInLasteWareHouse: string | null;
  TotalDateInLasteWareHouse: number;
  DateOutWarehouse: string | null;
  IMG: string | null;
  AdditionFeeCNY: number | null;
  AdditionFeeVND: number | null;
  SensorFeeCNY: number | null;
  SensorFeeVND: number | null;
  Currency: number;
  IsLost: boolean;
  StaffVNWarehouse: string;
  StaffVNOutWarehouse: string;
  CurrentPlaceId: number;
  UserName: string;
  Phone: string;
  IsTemp: boolean;
  PackageCodeTemp: string | null;
  IsHelpMoving: boolean;
  DonGia: number;
  PriceWeight: number;
  DateInVNTemp: string | null;
  RowNumber: number;
  Id: number;
  Created: string;
  CreatedBy: string;
  Updated: string | null;
  UpdatedBy: string | null;
  Deleted: boolean;
  Active: boolean;
}

export interface HoabinhOrderItem {
  StatusComplain: number;
  StatusComplainName: string;
  UID: number;
  TitleOrigin: string;
  TitleTranslated: string;
  Quantity: number;
  RealPrice: number;
  Brand: string;
  ProductStatus: number;
  ProductStatusName: string;
  PriceOrigin: number;
  PricePromotion: number;
  PropertyTranslated: string;
  Property: string;
  DataValue: string;
  ImageOrigin: string;
  ShopId: string;
  ShopName: string;
  SellerId: string;
  Wangwang: string;
  Stock: number;
  LocationSale: string;
  Site: string;
  Comment: string;
  ItemId: string;
  LinkOrigin: string;
  OuterId: string;
  Error: string;
  Weight: number;
  CategoryName: string;
  CategoryId: number;
  Tool: string;
  Version: string;
  IsTranslate: boolean;
  UPriceBuy: number;
  UPriceBuyVN: number;
  IsFastDelivery: boolean;
  IsFastDeliveryPrice: number;
  IsCheckProduct: boolean;
  IsCheckProductPrice: number;
  IsPacked: boolean;
  IsPackedPrice: number;
  IsFast: boolean;
  IsFastPrice: number;
  PriceVND: number;
  PriceCNY: number;
  FeeShipCN: number;
  FeeBuyPro: number;
  FeeWeight: number;
  Note: string;
  FullName: string;
  Address: string;
  Email: string;
  Phone: string;
  Status: number;
  Deposit: number;
  CurrentCNYVN: number;
  TotalPriceVND: number;
  PriceChange: number;
  MainOrderId: number;
  ProductNote: string;
  StepPrice: string;
  OrderShopCode: string;
  IsBuy: boolean;
  UserName: string | null;
  RowNumber: number;
  Id: number;
  Created: string;
  CreatedBy: string;
  Updated: string | null;
  UpdatedBy: string | null;
  Deleted: boolean;
  Active: boolean;
}

export interface HoabinhPayOrderHistory {
  MainOrderId: number;
  UID: number;
  Status: number;
  StatusName: string;
  Amount: number;
  Type: number;
  TypeName: string;
  RowNumber: number;
  Id: number;
  Created: string;
  CreatedBy: string;
  Updated: string | null;
  UpdatedBy: string | null;
  Deleted: boolean;
  Active: boolean;
}

export interface HoabinhOrderComment {
  UID: number;
  MainOrderId: number;
  Comment: string;
  Type: number;
  TypeName: string;
  FileLink: string;
  UserName: string;
  IsEmployment: number;
  RowNumber: number;
  Id: number;
  Created: string;
  CreatedBy: string;
  Updated: string | null;
  UpdatedBy: string | null;
  Deleted: boolean;
  Active: boolean;
}

export interface HoabinhMainOrderData {
  SameId: number | null;
  IsSpecialFeeOne: boolean | null;
  IsSpecialFeeTwo: boolean | null;
  SpecialFee: number;
  DateComplain: string | null;
  NoteOfAccount: string;
  TotalOrder: number | null;
  FirstOrder: number | null;
  IsCheckImport: boolean;
  ExpectedDeliveryDay: string;
  ExpectedDeliveryDate: string | null;
  Quantity: number | null;
  UpdateCurrency: number | null;
  DateReceived: string | null;
  ReceivedBy: string;
  StaffNote: string;
  CskhName: string | null;
  CskhId: number | null;
  SpecialInsurance: number | null;
  IsSpecialInsurance: boolean | null;
  DateBackToVN: string | null;
  DateBuying: string | null;
  DateDelivery: string | null;
  DateWaitHCM: string | null;
  WaitHCMBy: string;
  DateGoingHCM: string | null;
  GoingHCMBy: string;
  MainOrderCode: string;
  OrderTransactionCode: string;
  IsHandle: number;
  IsBuy: number;
  MainOrderCodes: HoabinhMainOrderCode[];
  IsChangeTQVNWeight: boolean;
  IsChangeFeeWeight: boolean;
  Status: number;
  StatusName: string;
  OrderType: number;
  OrderTypeName: string;
  IsCheckNotiPrice: boolean;
  FeeInWareHouse: number;
  TotalPriceVND: number;
  TotalOrderAmount: number;
  AmountDeposit: number;
  Deposit: number;
  RemainingAmount: number;
  ReceivePlace: number;
  ReceivePlaceName: string;
  FromPlace: number;
  FromPlaceName: string;
  ShippingType: number;
  ShippingTypeName: string;
  IsCheckProduct: boolean;
  IsPacked: boolean;
  IsInsurance: boolean;
  InsurancePercent: number;
  IsFastDelivery: boolean;
  SmallPackages: HoabinhSmallPackage[];
  IsDoneSmallPackage: boolean;
  PriceVND: number;
  PriceCNY: number;
  CurrentCNYVN: number;
  FeeBuyPro: number;
  FeeBuyProCNY: number;
  CKFeeBuyPro: number;
  IsCheckProductPrice: number;
  IsCheckProductPriceCNY: number;
  IsPackedPrice: number;
  IsPackedPriceCNY: number;
  InsuranceMoney: number;
  IsFastDeliveryPrice: number;
  Surcharge: number;
  UID: number;
  UserName: string;
  Wallet: number;
  FullName: string;
  Address: string;
  Email: string;
  Phone: string;
  ReceiverFullName: string;
  ReceiverPhone: string;
  DeliveryAddress: string;
  ReceiverEmail: string;
  Note: string | null;
  Orders: HoabinhOrderItem[];
  PayOrderHistories: HoabinhPayOrderHistory[];
  HistoryOrderChanges: unknown[];
  Complains: unknown[];
  FeeSupports: unknown[];
  OrderComments: HoabinhOrderComment[];
  TotalPriceReal: number;
  TotalPriceRealCNY: number;
  FeeShipCNCNY: number;
  FeeShipCN: number;
  FeeShipCNRealCNY: number;
  FeeShipCNReal: number;
  HHCNY: number;
  HH: number;
  OrderWeight: number;
  FeeWeightCK: number;
  FeeBuyProCK: number;
  TQVNWeight: number;
  TQVNVolume: number;
  FeeWeight: number;
  ImageOrigin: string;
  ShopId: string;
  ShopName: string;
  Site: string;
  SalerId: number;
  DatHangId: number;
  DepositDate: string | null;
  PayDate: string | null;
  DateBuy: string | null;
  DateTQ: string | null;
  DateVN: string | null;
  CompleteDate: string | null;
  CancelDate: string | null;
  ExpectedDate: string | null;
  TotalLink: number;
  TotalAllPrice: number;
  TotalAllPriceReal: number;
  TotalAllDeposit: number;
  TotalAllRemain: number;
  TotalStatus0: number;
  TotalStatus1: number;
  TotalStatus2: number;
  TotalStatus5: number;
  TotalStatus6: number;
  TotalStatus7: number;
  TotalStatus9: number;
  TotalStatus10: number;
  MainOrderTransactionCode: string;
  MainOrderTransactionCodeDetails: unknown;
  LessDeposit: number;
  FeeBuyProPT: number;
  FeeBuyProUser: number;
  IsComplain: boolean;
  IsUpdatePrice: boolean;
  FeeShipCNToVN: number;
  OrdererUserName: string;
  SalerUserName: string;
  OrderTransactionCodes: unknown;
  RowNumber: number;
  Id: number;
  Created: string;
  CreatedBy: string;
  Updated: string | null;
  UpdatedBy: string | null;
  Deleted: boolean;
  Active: boolean;
}

export interface HoabinhApiResponse {
  Success: boolean;
  Data: HoabinhMainOrderData;
  ResultCode: number;
  ResultMessage: string | null;
}

/**
 * Bản ghi gốc chuẩn 100% từ API https://hoabinhlogistics.com/api/main-order/55479
 * Dùng để khởi tạo và tự động Restore Data khi gọi API hoặc bấm Khôi phục dữ liệu
 */
export const HOABINH_ORDER_55479_RESPONSE: HoabinhApiResponse = {
  Success: true,
  Data: {
    SameId: null,
    IsSpecialFeeOne: null,
    IsSpecialFeeTwo: null,
    SpecialFee: 0.0,
    DateComplain: null,
    NoteOfAccount: '',
    TotalOrder: null,
    FirstOrder: null,
    IsCheckImport: true,
    ExpectedDeliveryDay: '',
    ExpectedDeliveryDate: null,
    Quantity: null,
    UpdateCurrency: null,
    DateReceived: '2026-10-18T15:26:15.2581897+07:00',
    ReceivedBy: 'KHOHN.BATU',
    StaffNote: '',
    CskhName: null,
    CskhId: 6162,
    SpecialInsurance: null,
    IsSpecialInsurance: null,
    DateBackToVN: '2026-10-15T07:15:06.3457249+07:00',
    DateBuying: '2026-10-07T13:44:54.7625632+07:00',
    DateDelivery: '2026-10-08T13:38:42.813453+07:00',
    DateWaitHCM: '2026-10-17T09:47:13.6098497+07:00',
    WaitHCMBy: 'khohn.baongoc',
    DateGoingHCM: '2026-10-17T10:14:32+07:00',
    GoingHCMBy: '',
    MainOrderCode: '',
    OrderTransactionCode: '',
    IsHandle: 1,
    IsBuy: 1,
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
        Updated: null,
        UpdatedBy: null,
        Deleted: false,
        Active: true,
      },
    ],
    IsChangeTQVNWeight: false,
    IsChangeFeeWeight: false,
    Status: 14,
    StatusName: 'Đã hoàn thành',
    OrderType: 1,
    OrderTypeName: 'Đơn hàng mua hộ',
    IsCheckNotiPrice: false,
    FeeInWareHouse: 0.0,
    TotalPriceVND: 9844276.0,
    TotalOrderAmount: 9844276.0,
    AmountDeposit: 7378400.0,
    Deposit: 9844276.0,
    RemainingAmount: 0.0,
    ReceivePlace: 1,
    ReceivePlaceName: 'Hồ Chí Minh',
    FromPlace: 1,
    FromPlaceName: 'Quảng Châu',
    ShippingType: 5,
    ShippingTypeName: 'NHANH - TIẾT KIỆM',
    IsCheckProduct: false,
    IsPacked: false,
    IsInsurance: false,
    InsurancePercent: 3.0,
    IsFastDelivery: false,
    SmallPackages: [
      {
        CskhName: null,
        UserAddress: null,
        MainOrderDepositDate: null,
        TypePaymentWeight: 1,
        ExpectedDeliveryDate: null,
        Quantity: null,
        ShippingName: null,
        WarehouseName: null,
        IsHCM: 0,
        TotalMustPay: null,
        WorkingSessionId: null,
        BackToVNBy: null,
        DateBackToVN: null,
        DateWaitHCM: null,
        WaitHCMBy: null,
        DateGoingHCM: null,
        GoingHCMBy: null,
        VolumePayment: 0.0,
        PriceVolume: 0.0,
        IsPayment: false,
        UID: 6176,
        MainOrderId: 55479,
        BigPackageId: null,
        BigPackageName: null,
        MainOrderCodeId: 38023,
        TransportationOrderId: null,
        MainOrderCode: 'Mua hộ: 55479',
        OrderTransactionCode: '500281968977',
        ProductType: null,
        Weight: 0.0,
        Volume: 0.0,
        PayableWeight: 0.0,
        Status: 2,
        StatusName: 'Chưa về kho TQ',
        Description: '3k',
        Length: null,
        Height: null,
        Width: null,
        LWH: ' x  x ',
        FloatingStatus: 0,
        FloatingStatusName: '',
        StaffNoteCheck: null,
        FloatingUserName: '',
        FloatingUserPhone: '',
        FeeShip: 0.0,
        UserNote: null,
        TotalPrice: 0.0,
        DateInTQWarehouse: null,
        StaffTQWarehouse: '',
        DateScanTQ: null,
        DateScanVN: null,
        TotalOrder: 0,
        TotalOrderQuantity: 0,
        TotalStatus0: 0,
        TotalStatus1: 0,
        TotalStatus2: 0,
        TotalStatus3: 0,
        TotalStatus4: 0,
        OrderType: 1,
        OrderTypeName: 'Đơn hàng mua hộ',
        Code: '5127805405728007936',
        IsCheckProduct: false,
        IsPackged: false,
        IsInsurance: false,
        DateInLasteWareHouse: null,
        TotalDateInLasteWareHouse: 0.0,
        DateOutWarehouse: null,
        IMG: null,
        AdditionFeeCNY: null,
        AdditionFeeVND: null,
        SensorFeeCNY: null,
        SensorFeeVND: null,
        Currency: 0.0,
        IsLost: false,
        StaffVNWarehouse: '',
        StaffVNOutWarehouse: '',
        CurrentPlaceId: 0,
        UserName: '',
        Phone: '',
        IsTemp: false,
        PackageCodeTemp: null,
        IsHelpMoving: false,
        DonGia: 0.0,
        PriceWeight: 0.0,
        DateInVNTemp: null,
        RowNumber: 0,
        Id: 495068,
        Created: '2026-10-08T13:38:42.837891+07:00',
        CreatedBy: 'dhkimlien',
        Updated: null,
        UpdatedBy: null,
        Deleted: false,
        Active: true,
      },
      {
        CskhName: null,
        UserAddress: null,
        MainOrderDepositDate: null,
        TypePaymentWeight: 1,
        ExpectedDeliveryDate: null,
        Quantity: null,
        ShippingName: null,
        WarehouseName: null,
        IsHCM: 0,
        TotalMustPay: null,
        WorkingSessionId: 11622,
        BackToVNBy: 'CSKH1_BAONGOC',
        DateBackToVN: '2026-10-15T07:15:06.3457249+07:00',
        DateWaitHCM: '2026-10-17T09:27:56.4817981+07:00',
        WaitHCMBy: 'khohn.baongoc',
        DateGoingHCM: '2026-10-17T10:14:32+07:00',
        GoingHCMBy: 'KHOHN.BATU',
        VolumePayment: 0.0,
        PriceVolume: 0.0,
        IsPayment: true,
        UID: 6176,
        MainOrderId: 55479,
        BigPackageId: 12472,
        BigPackageName: 'K910-118      118T',
        MainOrderCodeId: 38023,
        TransportationOrderId: 0,
        MainOrderCode: 'Mua hộ: 55479',
        OrderTransactionCode: '50028196897700030003',
        ProductType: '',
        Weight: 18.86,
        Volume: 0.0,
        PayableWeight: 18.86,
        Status: 13,
        StatusName: 'Đã giao khách hàng',
        Description: '',
        Length: 0.0,
        Height: 0.0,
        Width: 0.0,
        LWH: '0.00 x 0.00 x 0.00',
        FloatingStatus: 0,
        FloatingStatusName: '',
        StaffNoteCheck: '',
        FloatingUserName: '',
        FloatingUserPhone: '',
        FeeShip: 0.0,
        UserNote: '',
        TotalPrice: 282900.0,
        DateInTQWarehouse: '2026-10-09T17:28:06.6010744+07:00',
        StaffTQWarehouse: '',
        DateScanTQ: null,
        DateScanVN: null,
        TotalOrder: 0,
        TotalOrderQuantity: 0,
        TotalStatus0: 0,
        TotalStatus1: 0,
        TotalStatus2: 0,
        TotalStatus3: 0,
        TotalStatus4: 0,
        OrderType: 1,
        OrderTypeName: 'Đơn hàng mua hộ',
        Code: '5127805405728007936',
        IsCheckProduct: false,
        IsPackged: false,
        IsInsurance: false,
        DateInLasteWareHouse: '2026-10-17T10:14:42.1428158+07:00',
        TotalDateInLasteWareHouse: 17.0,
        DateOutWarehouse: '2026-10-18T15:26:15.2581897+07:00',
        IMG: '',
        AdditionFeeCNY: 0.0,
        AdditionFeeVND: 0.0,
        SensorFeeCNY: 0.0,
        SensorFeeVND: 0.0,
        Currency: 0.0,
        IsLost: false,
        StaffVNWarehouse: 'KHOHN.BATU',
        StaffVNOutWarehouse: 'KHOHN.BATU',
        CurrentPlaceId: 0,
        UserName: '',
        Phone: '',
        IsTemp: false,
        PackageCodeTemp: null,
        IsHelpMoving: false,
        DonGia: 15000.0,
        PriceWeight: 15000.0,
        DateInVNTemp: null,
        RowNumber: 0,
        Id: 495282,
        Created: '2026-10-09T17:28:07.0584634+07:00',
        CreatedBy: 'kt1ngocdiep',
        Updated: '2026-10-18T15:26:15.2625208+07:00',
        UpdatedBy: 'KHOHN.BATU',
        Deleted: false,
        Active: true,
      },
      {
        CskhName: null,
        UserAddress: null,
        MainOrderDepositDate: null,
        TypePaymentWeight: 1,
        ExpectedDeliveryDate: null,
        Quantity: null,
        ShippingName: null,
        WarehouseName: null,
        IsHCM: 0,
        TotalMustPay: null,
        WorkingSessionId: 11622,
        BackToVNBy: 'CSKH1_BAONGOC',
        DateBackToVN: '2026-10-15T07:15:06.3457249+07:00',
        DateWaitHCM: '2026-10-17T09:30:18.6997305+07:00',
        WaitHCMBy: 'khohn.baongoc',
        DateGoingHCM: '2026-10-17T10:14:32+07:00',
        GoingHCMBy: 'KHOHN.BATU',
        VolumePayment: 0.0,
        PriceVolume: 0.0,
        IsPayment: true,
        UID: 6176,
        MainOrderId: 55479,
        BigPackageId: 12472,
        BigPackageName: 'K910-118      118T',
        MainOrderCodeId: 38023,
        TransportationOrderId: 0,
        MainOrderCode: 'Mua hộ: 55479',
        OrderTransactionCode: '50028196897700030002',
        ProductType: '',
        Weight: 12.78,
        Volume: 0.0,
        PayableWeight: 12.78,
        Status: 13,
        StatusName: 'Đã giao khách hàng',
        Description: '',
        Length: 0.0,
        Height: 0.0,
        Width: 0.0,
        LWH: '0.00 x 0.00 x 0.00',
        FloatingStatus: 0,
        FloatingStatusName: '',
        StaffNoteCheck: '',
        FloatingUserName: '',
        FloatingUserPhone: '',
        FeeShip: 0.0,
        UserNote: '',
        TotalPrice: 191700.0,
        DateInTQWarehouse: '2026-10-09T17:28:06.6010744+07:00',
        StaffTQWarehouse: '',
        DateScanTQ: null,
        DateScanVN: null,
        TotalOrder: 0,
        TotalOrderQuantity: 0,
        TotalStatus0: 0,
        TotalStatus1: 0,
        TotalStatus2: 0,
        TotalStatus3: 0,
        TotalStatus4: 0,
        OrderType: 1,
        OrderTypeName: 'Đơn hàng mua hộ',
        Code: '5127805405728007936',
        IsCheckProduct: false,
        IsPackged: false,
        IsInsurance: false,
        DateInLasteWareHouse: '2026-10-17T10:14:42.1428158+07:00',
        TotalDateInLasteWareHouse: 17.0,
        DateOutWarehouse: '2026-10-18T15:26:15.2581897+07:00',
        IMG: '',
        AdditionFeeCNY: 0.0,
        AdditionFeeVND: 0.0,
        SensorFeeCNY: 0.0,
        SensorFeeVND: 0.0,
        Currency: 0.0,
        IsLost: false,
        StaffVNWarehouse: 'KHOHN.BATU',
        StaffVNOutWarehouse: 'KHOHN.BATU',
        CurrentPlaceId: 0,
        UserName: '',
        Phone: '',
        IsTemp: false,
        PackageCodeTemp: null,
        IsHelpMoving: false,
        DonGia: 15000.0,
        PriceWeight: 15000.0,
        DateInVNTemp: null,
        RowNumber: 0,
        Id: 495283,
        Created: '2026-10-09T17:28:07.0964918+07:00',
        CreatedBy: 'kt1ngocdiep',
        Updated: '2026-10-18T15:26:15.2671636+07:00',
        UpdatedBy: 'KHOHN.BATU',
        Deleted: false,
        Active: true,
      },
      {
        CskhName: null,
        UserAddress: null,
        MainOrderDepositDate: null,
        TypePaymentWeight: 1,
        ExpectedDeliveryDate: null,
        Quantity: null,
        ShippingName: null,
        WarehouseName: null,
        IsHCM: 0,
        TotalMustPay: null,
        WorkingSessionId: 11622,
        BackToVNBy: 'CSKH1_BAONGOC',
        DateBackToVN: '2026-10-15T07:15:06.3457249+07:00',
        DateWaitHCM: '2026-10-17T09:47:13.6098497+07:00',
        WaitHCMBy: 'khohn.baongoc',
        DateGoingHCM: '2026-10-17T10:14:32+07:00',
        GoingHCMBy: 'KHOHN.BATU',
        VolumePayment: 0.0,
        PriceVolume: 0.0,
        IsPayment: true,
        UID: 6176,
        MainOrderId: 55479,
        BigPackageId: 12472,
        BigPackageName: 'K910-118      118T',
        MainOrderCodeId: 38023,
        TransportationOrderId: 0,
        MainOrderCode: 'Mua hộ: 55479',
        OrderTransactionCode: '50028196897700030001',
        ProductType: '',
        Weight: 2.4,
        Volume: 0.0,
        PayableWeight: 2.4,
        Status: 13,
        StatusName: 'Đã giao khách hàng',
        Description: '',
        Length: 0.0,
        Height: 0.0,
        Width: 0.0,
        LWH: '0.00 x 0.00 x 0.00',
        FloatingStatus: 0,
        FloatingStatusName: '',
        StaffNoteCheck: '',
        FloatingUserName: '',
        FloatingUserPhone: '',
        FeeShip: 0.0,
        UserNote: '',
        TotalPrice: 36000.0,
        DateInTQWarehouse: '2026-10-09T17:28:06.6010744+07:00',
        StaffTQWarehouse: '',
        DateScanTQ: null,
        DateScanVN: null,
        TotalOrder: 0,
        TotalOrderQuantity: 0,
        TotalStatus0: 0,
        TotalStatus1: 0,
        TotalStatus2: 0,
        TotalStatus3: 0,
        TotalStatus4: 0,
        OrderType: 1,
        OrderTypeName: 'Đơn hàng mua hộ',
        Code: '5127805405728007936',
        IsCheckProduct: false,
        IsPackged: false,
        IsInsurance: false,
        DateInLasteWareHouse: '2026-10-17T10:14:42.1428158+07:00',
        TotalDateInLasteWareHouse: 17.0,
        DateOutWarehouse: '2026-10-18T15:26:15.2581897+07:00',
        IMG: '',
        AdditionFeeCNY: 0.0,
        AdditionFeeVND: 0.0,
        SensorFeeCNY: 0.0,
        SensorFeeVND: 0.0,
        Currency: 0.0,
        IsLost: false,
        StaffVNWarehouse: 'KHOHN.BATU',
        StaffVNOutWarehouse: 'KHOHN.BATU',
        CurrentPlaceId: 0,
        UserName: '',
        Phone: '',
        IsTemp: false,
        PackageCodeTemp: null,
        IsHelpMoving: false,
        DonGia: 15000.0,
        PriceWeight: 15000.0,
        DateInVNTemp: null,
        RowNumber: 0,
        Id: 495286,
        Created: '2026-10-09T17:28:07.2079215+07:00',
        CreatedBy: 'kt1ngocdiep',
        Updated: '2026-10-18T15:26:15.2686222+07:00',
        UpdatedBy: 'KHOHN.BATU',
        Deleted: false,
        Active: true,
      },
    ],
    IsDoneSmallPackage: true,
    PriceVND: 9223000.0,
    PriceCNY: 2300.0,
    CurrentCNYVN: 4010.0,
    FeeBuyPro: 110676.0,
    FeeBuyProCNY: 27.6,
    CKFeeBuyPro: 27.6,
    IsCheckProductPrice: 0.0,
    IsCheckProductPriceCNY: 0.0,
    IsPackedPrice: 0.0,
    IsPackedPriceCNY: 0.0,
    InsuranceMoney: 0.0,
    IsFastDeliveryPrice: 0.0,
    Surcharge: 0.0,
    UID: 6176,
    UserName: 'tranbon1',
    Wallet: 7017.0,
    FullName: 'bon',
    Address: '1705 Huỳnh Tấn Phát, Phú Mỹ, Quận 7, Thành phố Hồ Chí Minh',
    Email: 'bon.nguyentranvn@gmail.com',
    Phone: '0354888977',
    ReceiverFullName: 'bon',
    ReceiverPhone: '0354888977',
    DeliveryAddress:
      '1705 Huỳnh Tấn Phát, Phú Mỹ, Quận 7, Thành phố Hồ Chí Minh',
    ReceiverEmail: 'bon.nguyentranvn@gmail.com',
    Note: null,
    Orders: [
      {
        StatusComplain: 0,
        StatusComplainName: 'Chưa khiếu nại',
        UID: 6176,
        TitleOrigin: 'Q版鬼灭潮玩我妻善逸弥豆子动漫睡眠手办小摆件人偶桌面车载',
        TitleTranslated:
          '[BonzStore] Mô Hình Chibi Kimetsu no Yaiba Zenitsu & Nezuko Dáng Ngủ Đắp Chăn (Bộ 8 Mẫu Túi)',
        Quantity: 10,
        RealPrice: 23.0,
        Brand: 'BonzStore Anime',
        ProductStatus: 1,
        ProductStatusName: 'Còn hàng',
        PriceOrigin: 14.0,
        PricePromotion: 14.0,
        PropertyTranslated: 'Bộ 8 mẫu Thanh Gươm Diệt Quỷ ngủ trong chăn (Đóng túi)',
        Property: ';被窝睡眠鬼灭8款（袋装）',
        DataValue: '',
        ImageOrigin:
          'https://cbu01.alicdn.com/img/ibank/O1CN01IxzLCZ1LucH1chua_!!2219358604313-0-cib.jpg',
        ShopId: '2219358604313',
        ShopName: '中山市源柯玩具商行（个体工商户）',
        SellerId: '2219358604313',
        Wangwang: '中山市源柯玩具商行（个体工商户）',
        Stock: 9999,
        LocationSale: '',
        Site: '1688',
        Comment: '',
        ItemId: '1073254875055',
        LinkOrigin:
          'https://detail.1688.com/offer/1073254875055.html?spm=a2615.pc_new_goods/2506.wp_pc_new_product_list.0',
        OuterId: '',
        Error: '',
        Weight: 0.0,
        CategoryName: 'Mô hình Chibi & Nendoroid',
        CategoryId: 0,
        Tool: '',
        Version: '',
        IsTranslate: false,
        UPriceBuy: 14.0,
        UPriceBuyVN: 56140.0,
        IsFastDelivery: false,
        IsFastDeliveryPrice: 0.0,
        IsCheckProduct: false,
        IsCheckProductPrice: 0.0,
        IsPacked: false,
        IsPackedPrice: 0.0,
        IsFast: false,
        IsFastPrice: 0.0,
        PriceVND: 561400.0,
        PriceCNY: 140.0,
        FeeShipCN: 0.0,
        FeeBuyPro: 0.0,
        FeeWeight: 0.0,
        Note: '',
        FullName: '',
        Address: '',
        Email: '',
        Phone: '',
        Status: 0,
        Deposit: 0.0,
        CurrentCNYVN: 4010.0,
        TotalPriceVND: 92230.0,
        PriceChange: 0.0,
        MainOrderId: 55479,
        ProductNote: '',
        StepPrice: '30-99:23|100-199:22|200-99999999:21|',
        OrderShopCode: '',
        IsBuy: false,
        UserName: null,
        RowNumber: 0,
        Id: 177035,
        Created: '2026-10-07T09:10:34.7987652+07:00',
        CreatedBy: 'tranbon1',
        Updated: '2026-10-07T09:12:29.4608149+07:00',
        UpdatedBy: 'CSKH1_BAONGOC',
        Deleted: false,
        Active: true,
      },
      {
        StatusComplain: 0,
        StatusComplainName: 'Chưa khiếu nại',
        UID: 6176,
        TitleOrigin: '终极火影疾风传终极之战潮玩公仔鸣人卡卡西盲盒潮玩儿童玩具手办',
        TitleTranslated:
          '[BonzStore] Mô Hình Naruto Shippuden Đại Chiến Nhẫn Giả Naruto & Kakashi Blindbox Chibi',
        Quantity: 20,
        RealPrice: 43.0,
        Brand: 'BonzStore Anime',
        ProductStatus: 1,
        ProductStatusName: 'Còn hàng',
        PriceOrigin: 43.0,
        PricePromotion: 43.0,
        PropertyTranslated: 'Bộ 6 mẫu Naruto Đại Chiến Nhẫn Giả (Đóng túi)',
        Property: ';6款终极火影袋装',
        DataValue: '',
        ImageOrigin:
          'https://cbu01.alicdn.com/img/ibank/O1CN014Ae4SU1hjPNeI12vF_!!2219358604313-0-cib.jpg',
        ShopId: '2219358604313',
        ShopName: '中山市源柯玩具商行（个体工商户）',
        SellerId: '2219358604313',
        Wangwang: '中山市源柯玩具商行（个体工商户）',
        Stock: 632807,
        LocationSale: '',
        Site: '1688',
        Comment: '',
        ItemId: '1060302986040',
        LinkOrigin:
          'https://detail.1688.com/offer/1060302986040.html?spm=a2615.pc_new_goods/2506.wp_pc_new_product_list.0',
        OuterId: '',
        Error: '',
        Weight: 0.0,
        CategoryName: 'Mô hình Chibi & Nendoroid',
        CategoryId: 0,
        Tool: '',
        Version: '',
        IsTranslate: false,
        UPriceBuy: 43.0,
        UPriceBuyVN: 172430.0,
        IsFastDelivery: false,
        IsFastDeliveryPrice: 0.0,
        IsCheckProduct: false,
        IsCheckProductPrice: 0.0,
        IsPacked: false,
        IsPackedPrice: 0.0,
        IsFast: false,
        IsFastPrice: 0.0,
        PriceVND: 172430.0,
        PriceCNY: 43.0,
        FeeShipCN: 0.0,
        FeeBuyPro: 0.0,
        FeeWeight: 0.0,
        Note: '',
        FullName: '',
        Address: '',
        Email: '',
        Phone: '',
        Status: 0,
        Deposit: 0.0,
        CurrentCNYVN: 4010.0,
        TotalPriceVND: 172430.0,
        PriceChange: 0.0,
        MainOrderId: 55479,
        ProductNote: '',
        StepPrice: '',
        OrderShopCode: '',
        IsBuy: false,
        UserName: null,
        RowNumber: 0,
        Id: 177034,
        Created: '2026-10-07T09:10:34.7987651+07:00',
        CreatedBy: 'tranbon1',
        Updated: null,
        UpdatedBy: null,
        Deleted: false,
        Active: true,
      },
      {
        StatusComplain: 0,
        StatusComplainName: 'Chưa khiếu nại',
        UID: 6176,
        TitleOrigin: '终极火影疾风传终极之战潮玩公仔鸣人卡卡西盲盒潮玩儿童玩具手办',
        TitleTranslated:
          '[BonzStore] Mô Hình Naruto Shippuden Đại Chiến Nhẫn Giả Naruto & Kakashi Blindbox Chibi',
        Quantity: 20,
        RealPrice: 65.0,
        Brand: 'BonzStore Anime',
        ProductStatus: 1,
        ProductStatusName: 'Còn hàng',
        PriceOrigin: 65.0,
        PricePromotion: 65.0,
        PropertyTranslated: 'Bộ 9 mẫu Naruto Đại Chiến Nhẫn Giả Full Set (Đóng túi)',
        Property: ';终极火影9款袋装',
        DataValue: '',
        ImageOrigin:
          'https://cbu01.alicdn.com/img/ibank/O1CN01bPt2HA1hjPNZhVUad_!!2219358604313-0-cib.jpg',
        ShopId: '2219358604313',
        ShopName: '中山市源柯玩具商行（个体工商户）',
        SellerId: '2219358604313',
        Wangwang: '中山市源柯玩具商行（个体工商户）',
        Stock: 632807,
        LocationSale: '',
        Site: '1688',
        Comment: '',
        ItemId: '1060302986040',
        LinkOrigin:
          'https://detail.1688.com/offer/1060302986040.html?spm=a2615.pc_new_goods/2506.wp_pc_new_product_list.0',
        OuterId: '',
        Error: '',
        Weight: 0.0,
        CategoryName: 'Mô hình Chibi & Nendoroid',
        CategoryId: 0,
        Tool: '',
        Version: '',
        IsTranslate: false,
        UPriceBuy: 65.0,
        UPriceBuyVN: 260650.0,
        IsFastDelivery: false,
        IsFastDeliveryPrice: 0.0,
        IsCheckProduct: false,
        IsCheckProductPrice: 0.0,
        IsPacked: false,
        IsPackedPrice: 0.0,
        IsFast: false,
        IsFastPrice: 0.0,
        PriceVND: 260650.0,
        PriceCNY: 65.0,
        FeeShipCN: 0.0,
        FeeBuyPro: 0.0,
        FeeWeight: 0.0,
        Note: '',
        FullName: '',
        Address: '',
        Email: '',
        Phone: '',
        Status: 0,
        Deposit: 0.0,
        CurrentCNYVN: 4010.0,
        TotalPriceVND: 260650.0,
        PriceChange: 0.0,
        MainOrderId: 55479,
        ProductNote: '',
        StepPrice: '',
        OrderShopCode: '',
        IsBuy: false,
        UserName: null,
        RowNumber: 0,
        Id: 177033,
        Created: '2026-10-07T09:10:34.7987646+07:00',
        CreatedBy: 'tranbon1',
        Updated: null,
        UpdatedBy: null,
        Deleted: false,
        Active: true,
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
        RowNumber: 0,
        Id: 74261,
        Created: '2026-10-18T15:26:15.2637528+07:00',
        CreatedBy: 'KHOHN.BATU',
        Updated: null,
        UpdatedBy: null,
        Deleted: false,
        Active: true,
      },
      {
        MainOrderId: 55479,
        UID: 6176,
        Status: 2,
        StatusName: 'Đặt cọc',
        Amount: 7378400.0,
        Type: 2,
        TypeName: 'Ví điện tử',
        RowNumber: 0,
        Id: 72865,
        Created: '2026-10-07T09:20:30.2865591+07:00',
        CreatedBy: 'tranbon1',
        Updated: null,
        UpdatedBy: null,
        Deleted: false,
        Active: true,
      },
    ],
    HistoryOrderChanges: [],
    Complains: [],
    FeeSupports: [],
    OrderComments: [
      {
        UID: 6176,
        MainOrderId: 55479,
        Comment:
          'https://hoabinhlogistics.com/Upload/6c66c476-4565-4906-9301-40912123529d-Screen%20Shot%202026-10-07%20at%2009.19.59.png',
        Type: 1,
        TypeName: 'Nhắn tin với khách',
        FileLink: '',
        UserName: '',
        IsEmployment: 0,
        RowNumber: 0,
        Id: 54820,
        Created: '2026-10-07T09:20:26.1749861+07:00',
        CreatedBy: 'tranbon1',
        Updated: null,
        UpdatedBy: null,
        Deleted: false,
        Active: true,
      },
      {
        UID: 6176,
        MainOrderId: 55479,
        Comment: 'Free vận chuyển nội địa',
        Type: 1,
        TypeName: 'Nhắn tin với khách',
        FileLink: '',
        UserName: '',
        IsEmployment: 0,
        RowNumber: 0,
        Id: 54817,
        Created: '2026-10-07T09:16:19.96418+07:00',
        CreatedBy: 'tranbon1',
        Updated: null,
        UpdatedBy: null,
        Deleted: false,
        Active: true,
      },
      {
        UID: 6176,
        MainOrderId: 55479,
        Comment:
          'https://hoabinhlogistics.com/Upload/f7f2d718-1225-4de8-ba5a-c638f0d60b44-Screen%20Shot%202026-10-07%20at%2009.15.33.png',
        Type: 1,
        TypeName: 'Nhắn tin với khách',
        FileLink: '',
        UserName: '',
        IsEmployment: 0,
        RowNumber: 0,
        Id: 54816,
        Created: '2026-10-07T09:16:00.0140168+07:00',
        CreatedBy: 'tranbon1',
        Updated: null,
        UpdatedBy: null,
        Deleted: false,
        Active: true,
      },
    ],
    TotalPriceReal: 9223000.0,
    TotalPriceRealCNY: 2300.0,
    FeeShipCNCNY: 0.0,
    FeeShipCN: 0.0,
    FeeShipCNRealCNY: 0.0,
    FeeShipCNReal: 0.0,
    HHCNY: 0.0,
    HH: 0.0,
    OrderWeight: 34.04,
    FeeWeightCK: 0.0,
    FeeBuyProCK: 0.0,
    TQVNWeight: 34.04,
    TQVNVolume: 0.0,
    FeeWeight: 510600.0,
    ImageOrigin:
      'https://cbu01.alicdn.com/img/ibank/O1CN01IxzLCZ1LucH1chua_!!2219358604313-0-cib.jpg',
    ShopId: '2219358604313',
    ShopName: '中山市源柯玩具商行（个体工商户）',
    Site: '1688',
    SalerId: 6150,
    DatHangId: 7062,
    DepositDate: '2026-10-07T09:20:30.278776+07:00',
    PayDate: '2026-10-18T15:26:15.2581897+07:00',
    DateBuy: '2026-10-07T16:44:23.9002411+07:00',
    DateTQ: null,
    DateVN: '2026-10-17T10:14:42.1428158+07:00',
    CompleteDate: '2026-10-22T00:57:47.72+07:00',
    CancelDate: null,
    ExpectedDate: '2026-10-07T09:20:30.278776+07:00',
    TotalLink: 0,
    TotalAllPrice: 0.0,
    TotalAllPriceReal: 0.0,
    TotalAllDeposit: 0.0,
    TotalAllRemain: 0.0,
    TotalStatus0: 0,
    TotalStatus1: 0,
    TotalStatus2: 0,
    TotalStatus5: 0,
    TotalStatus6: 0,
    TotalStatus7: 0,
    TotalStatus9: 0,
    TotalStatus10: 0,
    MainOrderTransactionCode: '',
    MainOrderTransactionCodeDetails: null,
    LessDeposit: 80.0,
    FeeBuyProPT: 0.0,
    FeeBuyProUser: 0.0,
    IsComplain: false,
    IsUpdatePrice: true,
    FeeShipCNToVN: 0.0,
    OrdererUserName: 'dhkimlien',
    SalerUserName: 'KDdohuyen2004',
    OrderTransactionCodes: null,
    RowNumber: 0,
    Id: 55479,
    Created: '2026-10-07T09:10:34.7965631+07:00',
    CreatedBy: 'tranbon1',
    Updated: '2026-10-22T00:57:47.72+07:00',
    UpdatedBy: 'Auto',
    Deleted: false,
    Active: true,
  },
  ResultCode: 200,
  ResultMessage: null,
};

