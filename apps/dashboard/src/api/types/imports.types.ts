export type ImportOrderTabType = 'CURRENT' | 'DRAFT' | 'APPROVED';

export interface HoabinhDecodedUserData {
  UserId: number;
  UserGroupId: number;
  UserName: string;
  IsCheckOTP: boolean;
  Roles: string[] | null;
  IsConfirmOTP: boolean;
}

export interface HoabinhDecodedJwt {
  userData: HoabinhDecodedUserData;
  nbf?: number;
  exp?: number;
  iat?: number;
  isExpired: boolean;
}

export interface HoabinhLoginPayload {
  userName: string;
  password?: string;
  customToken?: string;
}

export interface HoabinhLoginResponse {
  Success: boolean;
  Data: {
    token: string;
  };
  ResultCode: number;
  ResultMessage: string | null;
  decoded?: HoabinhDecodedJwt;
  tokenConfig?: ImportTokenConfig;
}

export interface HoabinhMainOrderQueryParams {
  OrderBy?: string; // default: 'Id desc'
  PageIndex?: number; // default: 1
  PageSize?: number; // default: 20
  UID?: number; // default: 6176
  OrderType?: number; // 1 = Hiện tại, 0 = Bản nháp, 2 = Đã duyệt
  tab?: ImportOrderTabType;
  search?: string;
  status?: string;
  site?: string;
}

export interface HoabinhMainOrderCode {
  MainOrderID: number;
  Code: string;
  OrderTransactionCode: string[];
  RowNumber: number;
  Id: number;
  Created: string;
  CreatedBy: string;
}

export interface HoabinhSmallPackage {
  Id: number;
  MainOrderId: number;
  MainOrderCode: string;
  OrderTransactionCode: string;
  BigPackageId: number | null;
  BigPackageName: string | null;
  Weight: number;
  Volume: number;
  PayableWeight: number;
  DonGia: number;
  PriceWeight: number;
  TotalPrice: number;
  Status: number;
  StatusName: string;
  Description: string;
  Code: string;
  BackToVNBy: string | null;
  DateInTQWarehouse: string | null;
  DateBackToVN: string | null;
  DateWaitHCM: string | null;
  WaitHCMBy: string | null;
  DateGoingHCM: string | null;
  GoingHCMBy: string | null;
  DateInLasteWareHouse: string | null;
  DateOutWarehouse: string | null;
  StaffVNWarehouse: string;
  StaffVNOutWarehouse: string;
  Created: string;
  CreatedBy: string;
  Updated: string | null;
  UpdatedBy: string | null;
}

export interface HoabinhOrderItem {
  Id: number;
  MainOrderId: number;
  ItemId: string;
  TitleOrigin: string;
  TitleTranslated: string;
  Property: string;
  PropertyTranslated: string;
  Quantity: number;
  RealPrice: number;
  PriceOrigin: number;
  PricePromotion: number;
  UPriceBuy: number;
  UPriceBuyVN: number;
  PriceCNY: number;
  PriceVND: number;
  TotalPriceVND: number;
  CurrentCNYVN: number;
  ImageOrigin: string;
  LinkOrigin: string;
  ShopId: string;
  ShopName: string;
  Wangwang: string;
  Site: string;
  Stock: number;
  StepPrice: string;
  ProductStatusName: string;
  StatusComplainName: string;
  Created: string;
  CreatedBy: string;
}

export interface HoabinhPayOrderHistory {
  Id: number;
  MainOrderId: number;
  UID: number;
  Status: number;
  StatusName: string;
  Amount: number;
  Type: number;
  TypeName: string;
  Created: string;
  CreatedBy: string;
}

export interface HoabinhOrderComment {
  Id: number;
  MainOrderId: number;
  UID: number;
  Comment: string;
  Type: number;
  TypeName: string;
  FileLink: string;
  Created: string;
  CreatedBy: string;
}

export interface HoabinhMainOrderData {
  Id: number;
  UID: number;
  UserName: string;
  FullName: string;
  Email: string;
  Phone: string;
  Wallet: number;
  Address: string;
  ReceiverFullName: string;
  ReceiverPhone: string;
  ReceiverEmail: string;
  DeliveryAddress: string;
  Status: number;
  StatusName: string;
  OrderType: number;
  OrderTypeName: string;
  FromPlaceName: string;
  ReceivePlaceName: string;
  ShippingTypeName: string;
  TotalPriceVND: number;
  TotalOrderAmount: number;
  AmountDeposit: number;
  Deposit: number;
  RemainingAmount: number;
  PriceVND: number;
  PriceCNY: number;
  TotalPriceReal: number;
  TotalPriceRealCNY: number;
  CurrentCNYVN: number;
  FeeBuyPro: number;
  FeeBuyProCNY: number;
  CKFeeBuyPro: number;
  FeeWeight: number;
  OrderWeight: number;
  TQVNWeight: number;
  LessDeposit: number;
  ShopId: string;
  ShopName: string;
  Site: string;
  ImageOrigin: string;
  OrdererUserName: string;
  SalerUserName: string;
  ReceivedBy: string;
  WaitHCMBy: string;
  GoingHCMBy: string;
  StaffNote: string;
  Note: string | null;
  Created: string;
  CreatedBy: string;
  Updated: string | null;
  UpdatedBy: string | null;
  DepositDate: string | null;
  DateBuy: string | null;
  DateBuying: string | null;
  DateDelivery: string | null;
  DateBackToVN: string | null;
  DateWaitHCM: string | null;
  DateGoingHCM: string | null;
  DateVN: string | null;
  DateReceived: string | null;
  PayDate: string | null;
  CompleteDate: string | null;
  MainOrderCodes: HoabinhMainOrderCode[];
  SmallPackages: HoabinhSmallPackage[];
  Orders: HoabinhOrderItem[];
  PayOrderHistories: HoabinhPayOrderHistory[];
  OrderComments: HoabinhOrderComment[];
}

export interface StoredImportOrderRecord {
  id: number;
  orderCode: string;
  sourceUrl: string;
  workflowTab?: ImportOrderTabType; // CURRENT (OrderType=1) | DRAFT (OrderType=0) | APPROVED (OrderType=2)
  orderTypeParam?: number; // 1 | 0 | 2
  approvedAt?: string | null;
  approvedBy?: string | null;
  syncedToCatalog: boolean;
  syncedToCashbook: boolean;
  lastSyncedAt: string;
  syncedProductIds: string[];
  rawData: HoabinhMainOrderData;
}

export interface ImportTokenConfig {
  token: string;
  maskedToken: string;
  accountUsername: string;
  uid?: number;
  userGroupId?: number;
  isCheckOTP?: boolean;
  isConfirmOTP?: boolean;
  tokenExp?: number;
  isExpired?: boolean;
  isLinked?: boolean;
  loginUrl: string;
  authApiUrl?: string;
  apiBaseUrl: string;
  updatedAt: string;
  hasToken: boolean;
}

export interface ImportOrderStats {
  totalOrders: number;
  currentTabCount?: number;
  draftTabCount?: number;
  approvedTabCount?: number;
  totalImportValueVND: number;
  totalImportValueCNY: number;
  totalDepositPaidVND: number;
  totalRemainingVND: number;
  totalWeightKg: number;
  totalSmallPackages: number;
  totalItemsQuantity: number;
  totalUniqueItems: number;
  hasActiveToken: boolean;
  maskedToken: string;
}

export interface ImportOrdersPaginatedResponse {
  data: StoredImportOrderRecord[];
  stats: ImportOrderStats;
  tokenConfig: ImportTokenConfig;
  requestInspector?: {
    method: string;
    requestUrl: string;
    orderBy: string;
    pageIndex: number;
    pageSize: number;
    uid: number;
    orderType: number;
    tab: ImportOrderTabType;
  };
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface FetchExternalOrderPayload {
  orderIdOrUrl?: string;
  token?: string;
  rawJson?: string;
  targetTab?: ImportOrderTabType;
  autoSyncProducts?: boolean;
  autoSyncCashbook?: boolean;
}
