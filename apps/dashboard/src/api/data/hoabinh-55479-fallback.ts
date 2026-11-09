import {
  AdminNotificationItem,
  NotificationAction,
  NotificationModuleType,
} from '../types/notification.types';
import {
  CashbookChartsAnalyticsResponse,
  CashbookPaginatedResponse,
  CashbookSourceCategoryItem,
  CashbookSummaryReport,
  CashbookVoucherItem,
  CashbookVoucherType,
  CreateCashbookSourceCategoryPayload,
  CreateCashbookVoucherPayload,
  UpdateCashbookSourceCategoryPayload,
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

export const HOABINH_REAL_JWT_TOKEN = '';

const LS_CASHBOOK_KEY = 'bonzstore_clean_cashbook_v1';
const LS_CASHBOOK_CATEGORIES_KEY = 'bonzstore_clean_cashbook_categories_v1';
const LS_OPENING_KEY = 'bonzstore_clean_opening_v1';
const LS_IMPORT_TOKEN_KEY = 'bonzstore_clean_import_token_v1';
const LS_IMPORT_ORDERS_KEY = 'bonzstore_clean_import_orders_v1';
const LS_LOCAL_NOTIFICATIONS_KEY = 'bonzstore_local_notifications_v1';

export function getLocalNotifications(): AdminNotificationItem[] {
  try {
    const raw = localStorage.getItem(LS_LOCAL_NOTIFICATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalNotifications(list: AdminNotificationItem[]): void {
  try {
    localStorage.setItem(
      LS_LOCAL_NOTIFICATIONS_KEY,
      JSON.stringify(list.slice(0, 100)),
    );
  } catch {
    // ignore
  }
}

export function recordLocalNotification(params: {
  action: NotificationAction;
  titleVi: string;
  titleEn: string;
  messageVi: string;
  messageEn: string;
  targetName: string;
  targetLink?: string;
  module?: NotificationModuleType;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
}): AdminNotificationItem {
  const list = getLocalNotifications();
  const item: AdminNotificationItem = {
    id: `notif-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    module: params.module || 'PRODUCTS',
    action: params.action,
    titleVi: params.titleVi,
    titleEn: params.titleEn,
    messageVi: params.messageVi,
    messageEn: params.messageEn,
    targetName: params.targetName,
    targetLink: params.targetLink || '/cashbook',
    actorName: params.actorName || 'BonzStore Super Admin',
    actorEmail: params.actorEmail || 'admin@bonzstore.vn',
    actorRole: params.actorRole || 'SUPER_ADMIN',
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  saveLocalNotifications([item, ...list]);
  return item;
}

export function markLocalNotificationRead(
  id: string,
  isRead = true,
): AdminNotificationItem | null {
  const list = getLocalNotifications();
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], isRead };
  saveLocalNotifications(list);
  return list[idx];
}

export function markAllLocalNotificationsRead(): number {
  const list = getLocalNotifications();
  let count = 0;
  const next = list.map((n) => {
    if (!n.isRead) {
      count += 1;
      return { ...n, isRead: true };
    }
    return n;
  });
  saveLocalNotifications(next);
  return count;
}

export function clearReadLocalNotifications(): number {
  const list = getLocalNotifications();
  const next = list.filter((n) => !n.isRead);
  const deleted = list.length - next.length;
  saveLocalNotifications(next);
  return deleted;
}

export function removeLocalNotification(id: string): boolean {
  const list = getLocalNotifications();
  const next = list.filter((n) => n.id !== id);
  if (next.length === list.length) return false;
  saveLocalNotifications(next);
  return true;
}

const DEFAULT_CASHBOOK_SOURCE_CATEGORIES: CashbookSourceCategoryItem[] = [
  {
    id: 'cat-inc-1',
    type: 'INCOME',
    code: 'INC-SALES',
    name: 'Bán hàng & Dịch vụ',
    description: 'Thu tiền bán hàng hóa và dịch vụ tại cửa hàng / online',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-inc-2',
    type: 'INCOME',
    code: 'INC-REFUND',
    name: 'Hoàn tiền đối tác / Logistics',
    description: 'Khoản hoàn tiền từ nhà cung cấp hoặc đơn vị vận chuyển',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-inc-3',
    type: 'INCOME',
    code: 'INC-DEBT',
    name: 'Thu hồi công nợ khách hàng',
    description: 'Khách hàng thanh toán công nợ kỳ trước',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-inc-4',
    type: 'INCOME',
    code: 'INC-OTHER',
    name: 'Thu nhập khác',
    description: 'Các khoản thu phát sinh ngoài hoạt động bán hàng chính',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-exp-1',
    type: 'EXPENSE',
    code: 'EXP-IMPORT',
    name: 'Nhập hàng & Thanh toán NCC',
    description: 'Thanh toán tiền cọc, tất toán đơn nhập hàng và nhà cung cấp',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-exp-2',
    type: 'EXPENSE',
    code: 'EXP-LOGISTICS',
    name: 'Cước vận chuyển & Logistics',
    description: 'Chi phí vận chuyển quốc tế, nội địa và phí kho bãi',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-exp-3',
    type: 'EXPENSE',
    code: 'EXP-SALARY',
    name: 'Lương & Thưởng nhân viên',
    description: 'Chi trả lương, phụ cấp và thưởng cho nhân sự hệ thống',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-exp-4',
    type: 'EXPENSE',
    code: 'EXP-OPS',
    name: 'Chi phí vận hành cửa hàng',
    description: 'Tiền mặt bằng, điện nước, văn phòng phẩm, phần mềm',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-exp-5',
    type: 'EXPENSE',
    code: 'EXP-OTHER',
    name: 'Khoản chi khác',
    description: 'Các khoản chi phát sinh khác',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// Xóa toàn bộ key dữ liệu mẫu cũ nếu còn tồn tại trên trình duyệt
function purgeLegacySampleKeys() {
  try {
    const legacyKeys = [
      'bonzstore_local_cashbook_v1',
      'bonzstore_local_opening_v1',
      'bonzstore_hoabinh_token_config_v2',
      'bonzstore_hoabinh_orders_v2',
      'bonzstore_hb_linked_session_v1',
      'bonzstore_internal_custom_orders_v1',
      'hoabinh_import_token',
    ];
    for (const k of legacyKeys) {
      localStorage.removeItem(k);
    }
  } catch {
    // ignore
  }
}
purgeLegacySampleKeys();

export const HOABINH_ORDER_55479_DATA: HoabinhMainOrderData = {
  Id: 0,
  UID: 0,
  UserName: '',
  FullName: '',
  Email: '',
  Phone: '',
  Wallet: 0,
  Address: '',
  ReceiverFullName: '',
  ReceiverPhone: '',
  ReceiverEmail: '',
  DeliveryAddress: '',
  Status: 0,
  StatusName: '',
  OrderType: 1,
  OrderTypeName: '',
  FromPlaceName: '',
  ReceivePlaceName: '',
  ShippingTypeName: '',
  TotalPriceVND: 0,
  TotalOrderAmount: 0,
  AmountDeposit: 0,
  Deposit: 0,
  RemainingAmount: 0,
  PriceVND: 0,
  PriceCNY: 0,
  TotalPriceReal: 0,
  TotalPriceRealCNY: 0,
  CurrentCNYVN: 0,
  FeeBuyPro: 0,
  FeeBuyProCNY: 0,
  CKFeeBuyPro: 0,
  FeeWeight: 0,
  OrderWeight: 0,
  TQVNWeight: 0,
  LessDeposit: 0,
  ShopId: '',
  ShopName: '',
  Site: '',
  ImageOrigin: '',
  OrdererUserName: '',
  SalerUserName: '',
  ReceivedBy: '',
  WaitHCMBy: '',
  GoingHCMBy: '',
  StaffNote: '',
  Note: null,
  Created: '',
  CreatedBy: '',
  Updated: null,
  UpdatedBy: null,
  DepositDate: null,
  DateBuy: null,
  DateBuying: null,
  DateDelivery: null,
  DateBackToVN: null,
  DateWaitHCM: null,
  DateGoingHCM: null,
  DateVN: null,
  DateReceived: null,
  PayDate: null,
  CompleteDate: null,
  MainOrderCodes: [],
  SmallPackages: [],
  Orders: [],
  PayOrderHistories: [],
  OrderComments: [],
};

export function decodeHoabinhJwt(rawToken: string): HoabinhDecodedJwt {
  try {
    const clean = (rawToken || '').trim().replace(/^Bearer\s+/i, '');
    if (!clean) {
      return {
        userData: {
          UserId: 0,
          UserGroupId: 0,
          UserName: '',
          IsCheckOTP: false,
          Roles: null,
          IsConfirmOTP: false,
        },
        isExpired: false,
      };
    }
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
        UserId: 0,
        UserGroupId: 0,
        UserName: '',
        IsCheckOTP: false,
        Roles: null as string[] | null,
        IsConfirmOTP: false,
      };
      if (parsed[claimKey]) {
        const inner =
          typeof parsed[claimKey] === 'string'
            ? JSON.parse(parsed[claimKey])
            : parsed[claimKey];
        userData = {
          UserId: Number(inner.UserId || 0),
          UserGroupId: Number(inner.UserGroupId || 0),
          UserName: String(inner.UserName || ''),
          IsCheckOTP: Boolean(inner.IsCheckOTP),
          Roles: inner.Roles || null,
          IsConfirmOTP: Boolean(inner.IsConfirmOTP),
        };
      } else if (parsed.uid || parsed.username) {
        userData.UserId = Number(parsed.uid || 0);
        userData.UserName = String(parsed.username || '');
      }
      const exp = parsed.exp ? Number(parsed.exp) : undefined;
      const nowSec = Math.floor(Date.now() / 1000);
      return {
        userData,
        nbf: parsed.nbf ? Number(parsed.nbf) : undefined,
        exp,
        iat: parsed.iat ? Number(parsed.iat) : undefined,
        isExpired: exp ? exp < nowSec : false,
      };
    }
  } catch {
    // ignore
  }
  return {
    userData: {
      UserId: 0,
      UserGroupId: 0,
      UserName: '',
      IsCheckOTP: false,
      Roles: null,
      IsConfirmOTP: false,
    },
    isExpired: false,
  };
}

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
  return {
    token: '',
    maskedToken: '',
    accountUsername: '',
    uid: 0,
    userGroupId: 0,
    isCheckOTP: false,
    isConfirmOTP: false,
    isExpired: false,
    isLinked: false,
    loginUrl: 'https://hoabinhlogistics.com',
    authApiUrl: 'https://hoabinhlogistics.com/api/authenticate/login',
    apiBaseUrl: 'https://hoabinhlogistics.com/api/main-order',
    updatedAt: new Date().toISOString(),
    hasToken: false,
  };
}

export function saveStoredImportTokenConfig(
  token: string,
  accountUsername?: string,
): ImportTokenConfig {
  const clean = (token || '').trim().replace(/^Bearer\s+/i, '');
  const decoded = decodeHoabinhJwt(clean);
  const next: ImportTokenConfig = {
    token: clean,
    maskedToken: maskTokenStr(clean),
    accountUsername:
      accountUsername?.trim() || decoded.userData.UserName || '',
    uid: decoded.userData.UserId || 0,
    userGroupId: decoded.userData.UserGroupId || 0,
    isCheckOTP: decoded.userData.IsCheckOTP,
    isConfirmOTP: decoded.userData.IsConfirmOTP,
    tokenExp: decoded.exp,
    isExpired: false,
    isLinked: Boolean(clean),
    loginUrl: 'https://hoabinhlogistics.com',
    authApiUrl: 'https://hoabinhlogistics.com/api/authenticate/login',
    apiBaseUrl: 'https://hoabinhlogistics.com/api/main-order',
    updatedAt: new Date().toISOString(),
    hasToken: Boolean(clean),
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
    token: '',
    maskedToken: '',
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
  const tokenToUse = (payload.customToken || '')
    .trim()
    .replace(/^Bearer\s+/i, '');
  const decoded = decodeHoabinhJwt(tokenToUse);
  if (payload.userName?.trim()) {
    decoded.userData.UserName = payload.userName.trim();
  }
  const tokenConfig = saveStoredImportTokenConfig(
    tokenToUse,
    decoded.userData.UserName,
  );
  return {
    Success: Boolean(tokenToUse),
    Data: {
      token: tokenToUse,
    },
    ResultCode: tokenToUse ? 200 : 400,
    ResultMessage: tokenToUse ? null : 'Chưa có token xác thực',
    decoded,
    tokenConfig,
  };
}

function getStoredImportOrdersList(): StoredImportOrderRecord[] {
  try {
    const raw = localStorage.getItem(LS_IMPORT_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredImportOrderRecord(
  record: StoredImportOrderRecord,
): StoredImportOrderRecord[] {
  const list = getStoredImportOrdersList();
  const idx = list.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.unshift(record);
  }
  try {
    localStorage.setItem(LS_IMPORT_ORDERS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  return list;
}

export function deleteStoredImportOrderRecord(
  orderId: number,
): StoredImportOrderRecord[] {
  const list = getStoredImportOrdersList().filter((r) => r.id !== orderId);
  try {
    localStorage.setItem(LS_IMPORT_ORDERS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  return list;
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
      status: 1,
      statusName: 'Đơn hiện tại',
      orderTypeName: 'Đơn hàng hiện tại',
    },
    DRAFT: {
      status: 0,
      statusName: 'Bản nháp',
      orderTypeName: 'Đơn hàng bản nháp',
    },
    APPROVED: {
      status: 14,
      statusName: 'Đã duyệt',
      orderTypeName: 'Đơn hàng đã duyệt',
    },
  };

  const idx = list.findIndex((r) => r.id === orderId);
  if (idx >= 0) {
    const sourceRecord = list[idx];
    list[idx] = {
      ...sourceRecord,
      workflowTab: targetTab,
      orderTypeParam: orderTypeMap[targetTab],
      approvedAt: targetTab === 'APPROVED' ? new Date().toISOString() : null,
      syncedToCatalog:
        targetTab === 'APPROVED' ? true : sourceRecord.syncedToCatalog,
      syncedToCashbook:
        targetTab === 'APPROVED' ? true : sourceRecord.syncedToCashbook,
      lastSyncedAt: new Date().toISOString(),
      rawData: {
        ...sourceRecord.rawData,
        OrderType: orderTypeMap[targetTab],
        OrderTypeName: statusMap[targetTab].orderTypeName,
        Status: statusMap[targetTab].status,
        StatusName: statusMap[targetTab].statusName,
      },
    };
    try {
      localStorage.setItem(LS_IMPORT_ORDERS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
  return list;
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
  const uid = Number(params?.UID || tokenConfig.uid || 0);
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

  if (params?.search) {
    const q = String(params.search).trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((r) => {
        const d = r.rawData;
        return (
          String(d.Id).includes(q) ||
          (r.orderCode || '').toLowerCase().includes(q) ||
          (d.ShopName || '').toLowerCase().includes(q)
        );
      });
    }
  }

  let totalImportValueVND = 0;
  let totalImportValueCNY = 0;
  let totalDepositPaidVND = 0;
  let totalRemainingVND = 0;
  let totalWeightKg = 0;
  let totalSmallPackages = 0;
  let totalItemsQuantity = 0;
  let totalUniqueItems = 0;

  for (const rec of allRecords) {
    const d = rec.rawData;
    totalImportValueVND += Number(d.TotalPriceVND || 0);
    totalImportValueCNY += Number(d.PriceCNY || 0);
    totalDepositPaidVND += Number(d.Deposit || 0);
    totalRemainingVND += Number(d.RemainingAmount || 0);
    totalWeightKg += Number(d.TQVNWeight || d.OrderWeight || 0);
    totalSmallPackages += (d.SmallPackages || []).length;
    totalUniqueItems += (d.Orders || []).length;
    for (const it of d.Orders || []) {
      totalItemsQuantity += Number(it.Quantity || 0);
    }
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(pageIndex, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagedData = filtered.slice(start, start + pageSize);

  const stats: ImportOrderStats = {
    totalOrders: allRecords.length,
    currentTabCount,
    draftTabCount,
    approvedTabCount,
    totalImportValueVND,
    totalImportValueCNY,
    totalDepositPaidVND,
    totalRemainingVND,
    totalWeightKg: Number(totalWeightKg.toFixed(2)),
    totalSmallPackages,
    totalItemsQuantity,
    totalUniqueItems,
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

function getStoredOpening() {
  try {
    const raw = localStorage.getItem(LS_OPENING_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { cash: 0, card: 0, transfer: 0, total: 0 };
}

function getStoredVouchers(): CashbookVoucherItem[] {
  try {
    const raw = localStorage.getItem(LS_CASHBOOK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
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

export function getFallbackCashbookPaginated(
  params?: Record<string, any>,
): CashbookPaginatedResponse {
  const allVouchers = getStoredVouchers();
  let list = [...allVouchers];
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
  if (params?.startDate) {
    const startObj = new Date(
      params.startDate.includes('T')
        ? params.startDate
        : `${params.startDate}T00:00:00`,
    );
    const startMs = startObj.getTime();
    if (!Number.isNaN(startMs)) {
      list = list.filter((v) => {
        const txMs = new Date(v.transactionDate || v.createdAt).getTime();
        const createdMs = new Date(v.createdAt || v.transactionDate).getTime();
        return txMs >= startMs || createdMs >= startMs;
      });
    }
  }
  if (params?.endDate) {
    const endObj = new Date(
      params.endDate.includes('T')
        ? params.endDate
        : `${params.endDate}T23:59:59.999`,
    );
    const endMs = endObj.getTime();
    if (!Number.isNaN(endMs)) {
      list = list.filter((v) => {
        const txMs = new Date(v.transactionDate || v.createdAt).getTime();
        const createdMs = new Date(v.createdAt || v.transactionDate).getTime();
        return txMs <= endMs || createdMs <= endMs;
      });
    }
  }
  if (params?.search) {
    const q = String(params.search).toLowerCase();
    list = list.filter(
      (v) =>
        v.voucherCode.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.content.toLowerCase().includes(q) ||
        (v.note || '').toLowerCase().includes(q) ||
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
      new Set(allVouchers.map((v) => v.category).filter(Boolean)),
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

export function getLocalSourceCategories(
  type?: CashbookVoucherType,
): CashbookSourceCategoryItem[] {
  let list: CashbookSourceCategoryItem[] = DEFAULT_CASHBOOK_SOURCE_CATEGORIES;
  try {
    const raw = localStorage.getItem(LS_CASHBOOK_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    } else {
      localStorage.setItem(
        LS_CASHBOOK_CATEGORIES_KEY,
        JSON.stringify(DEFAULT_CASHBOOK_SOURCE_CATEGORIES),
      );
    }
  } catch {
    // ignore
  }
  if (type === 'INCOME' || type === 'EXPENSE') {
    return list.filter((c) => c.type === type);
  }
  return list;
}

export function createLocalSourceCategory(
  payload: CreateCashbookSourceCategoryPayload,
): CashbookSourceCategoryItem {
  const all = getLocalSourceCategories();
  const normalizedCode = payload.code.trim().toUpperCase();
  const exists = all.find(
    (c) =>
      c.type === payload.type &&
      (c.code.toUpperCase() === normalizedCode ||
        c.name.toLowerCase() === payload.name.trim().toLowerCase()),
  );
  if (exists) {
    throw new Error('Mã hoặc tên nguồn thu/khoản chi đã tồn tại');
  }
  const now = new Date().toISOString();
  const item: CashbookSourceCategoryItem = {
    id: `cat-${Date.now()}`,
    type: payload.type,
    code: normalizedCode,
    name: payload.name.trim(),
    description: payload.description?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };
  const next = [item, ...all];
  try {
    localStorage.setItem(LS_CASHBOOK_CATEGORIES_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  recordLocalNotification({
    action: 'CREATE',
    titleVi:
      item.type === 'INCOME'
        ? 'Thêm mới Nguồn Thu sổ quỹ'
        : 'Thêm mới Khoản Chi sổ quỹ',
    titleEn:
      item.type === 'INCOME'
        ? 'New Income Source Created'
        : 'New Expense Category Created',
    messageVi: `Đã tạo ${item.type === 'INCOME' ? 'nguồn thu' : 'khoản chi'} "${item.name}" (${item.code}) trong Sổ Quỹ.`,
    messageEn: `Created ${item.type.toLowerCase()} source "${item.name}" (${item.code}) in Cashbook.`,
    targetName: item.code,
    targetLink: '/cashbook',
  });
  return item;
}

export function updateLocalSourceCategory(
  id: string,
  payload: UpdateCashbookSourceCategoryPayload,
): CashbookSourceCategoryItem {
  const all = getLocalSourceCategories();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new Error('Không tìm thấy loại nguồn thu/chi');
  }
  const current = all[idx];
  const updated: CashbookSourceCategoryItem = {
    ...current,
    code:
      payload.code !== undefined
        ? payload.code.trim().toUpperCase()
        : current.code,
    name: payload.name !== undefined ? payload.name.trim() : current.name,
    description:
      payload.description !== undefined
        ? payload.description.trim()
        : current.description,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  try {
    localStorage.setItem(LS_CASHBOOK_CATEGORIES_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
  recordLocalNotification({
    action: 'UPDATE',
    titleVi: 'Cập nhật Nguồn Thu / Khoản Chi sổ quỹ',
    titleEn: 'Cashbook Source Category Updated',
    messageVi: `Đã cập nhật mục "${updated.name}" (${updated.code}) trong Sổ Quỹ.`,
    messageEn: `Updated source category "${updated.name}" (${updated.code}) in Cashbook.`,
    targetName: updated.code,
    targetLink: '/cashbook',
  });
  return updated;
}

export function deleteLocalSourceCategory(id: string): { deletedId: string } {
  const existing = getLocalSourceCategories();
  const removed = existing.find((c) => c.id === id);
  const all = existing.filter((c) => c.id !== id);
  try {
    localStorage.setItem(LS_CASHBOOK_CATEGORIES_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
  if (removed) {
    recordLocalNotification({
      action: 'DELETE',
      titleVi: 'Xóa Nguồn Thu / Khoản Chi sổ quỹ',
      titleEn: 'Cashbook Source Category Deleted',
      messageVi: `Đã xóa mục "${removed.name}" (${removed.code}) khỏi Sổ Quỹ.`,
      messageEn: `Deleted source category "${removed.name}" (${removed.code}) from Cashbook.`,
      targetName: removed.code,
      targetLink: '/cashbook',
    });
  }
  return { deletedId: id };
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
  const sameTypeCount = list.filter((v) => v.type === payload.type).length;
  const voucherCode =
    payload.voucherCode?.trim() ||
    `${prefix}-112834${String(sameTypeCount + 1).padStart(6, '0')}`;

  const item: CashbookVoucherItem = {
    id: `cb-${Date.now()}`,
    voucherCode,
    transactionDate: payload.transactionDate || new Date().toISOString(),
    type: payload.type,
    category: payload.category,
    categoryCode: payload.categoryCode,
    content: payload.content || payload.note || payload.category,
    cashAmount,
    cardAmount,
    transferAmount,
    totalAmount,
    payerGroup: payload.payerGroup || 'PARTNER',
    partnerName: payload.partnerName,
    staffName: payload.staffName || '',
    isBusinessAccounting: payload.isBusinessAccounting ?? true,
    operatorTokenInfo: payload.operatorTokenInfo,
    importOrderId: payload.importOrderId ?? null,
    externalPaymentId: null,
    note: payload.note || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const next = [item, ...list];
  localStorage.setItem(LS_CASHBOOK_KEY, JSON.stringify(next));

  recordLocalNotification({
    action: 'CREATE',
    titleVi:
      item.type === 'INCOME'
        ? 'Lập Phiếu Thu sổ quỹ mới'
        : 'Lập Phiếu Chi sổ quỹ mới',
    titleEn:
      item.type === 'INCOME'
        ? 'New Cashbook Receipt Created'
        : 'New Cashbook Payment Created',
    messageVi: `Đã lập ${item.type === 'INCOME' ? 'Phiếu Thu' : 'Phiếu Chi'} ${item.voucherCode} (${item.totalAmount.toLocaleString('vi-VN')}₫) — ${item.category}${item.note ? ` • Ghi chú: ${item.note}` : ''}.`,
    messageEn: `Created ${item.type} voucher ${item.voucherCode} (${item.totalAmount.toLocaleString('vi-VN')} VND) — ${item.category}.`,
    targetName: item.voucherCode,
    targetLink: '/cashbook',
    actorName: item.operatorTokenInfo?.fullName || item.staffName,
    actorEmail: item.operatorTokenInfo?.email,
    actorRole: item.operatorTokenInfo?.roleCode,
  });

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
      payload.cashAmount !== undefined
        ? Number(payload.cashAmount)
        : old.cashAmount;
    const cardAmount =
      payload.cardAmount !== undefined
        ? Number(payload.cardAmount)
        : old.cardAmount;
    const transferAmount =
      payload.transferAmount !== undefined
        ? Number(payload.transferAmount)
        : old.transferAmount;
    const updated: CashbookVoucherItem = {
      ...old,
      ...payload,
      cashAmount,
      cardAmount,
      transferAmount,
      totalAmount: cashAmount + cardAmount + transferAmount,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    localStorage.setItem(LS_CASHBOOK_KEY, JSON.stringify(list));

    recordLocalNotification({
      action: 'UPDATE',
      titleVi:
        updated.type === 'INCOME'
          ? 'Cập nhật Phiếu Thu sổ quỹ'
          : 'Cập nhật Phiếu Chi sổ quỹ',
      titleEn: 'Cashbook Voucher Updated',
      messageVi: `Đã chỉnh sửa phiếu ${updated.voucherCode} (${updated.totalAmount.toLocaleString('vi-VN')}₫) — ${updated.category}${updated.note ? ` • Ghi chú: ${updated.note}` : ''}.`,
      messageEn: `Updated voucher ${updated.voucherCode} (${updated.totalAmount.toLocaleString('vi-VN')} VND).`,
      targetName: updated.voucherCode,
      targetLink: '/cashbook',
      actorName: updated.operatorTokenInfo?.fullName || updated.staffName,
      actorEmail: updated.operatorTokenInfo?.email,
      actorRole: updated.operatorTokenInfo?.roleCode,
    });
  }
  return {
    voucher: idx >= 0 ? list[idx] : undefined,
    summary: computeLocalCashbookSummary(list),
  };
}

export function deleteLocalCashbookVoucher(id: string) {
  const existing = getStoredVouchers();
  const removed = existing.find((v) => v.id === id);
  const list = existing.filter((v) => v.id !== id);
  localStorage.setItem(LS_CASHBOOK_KEY, JSON.stringify(list));

  if (removed) {
    recordLocalNotification({
      action: 'DELETE',
      titleVi: 'Xóa phiếu khỏi Sổ Quỹ',
      titleEn: 'Cashbook Voucher Deleted',
      messageVi: `Đã xóa ${removed.type === 'INCOME' ? 'Phiếu Thu' : 'Phiếu Chi'} ${removed.voucherCode} (${removed.totalAmount.toLocaleString('vi-VN')}₫) khỏi Sổ Quỹ.`,
      messageEn: `Deleted voucher ${removed.voucherCode} (${removed.totalAmount.toLocaleString('vi-VN')} VND) from Cashbook.`,
      targetName: removed.voucherCode,
      targetLink: '/cashbook',
      actorName: removed.operatorTokenInfo?.fullName || removed.staffName,
      actorEmail: removed.operatorTokenInfo?.email,
      actorRole: removed.operatorTokenInfo?.roleCode,
    });
  }

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

  recordLocalNotification({
    action: 'UPDATE',
    titleVi: 'Cập nhật Số dư Đầu kỳ Sổ Quỹ',
    titleEn: 'Cashbook Opening Balance Updated',
    messageVi: `Đã cập nhật Số dư Đầu kỳ Sổ Quỹ: Tổng ${next.total.toLocaleString('vi-VN')}₫ (Tiền mặt: ${next.cash.toLocaleString('vi-VN')}₫, Thẻ: ${next.card.toLocaleString('vi-VN')}₫, CK: ${next.transfer.toLocaleString('vi-VN')}₫).`,
    messageEn: `Updated Cashbook Opening Balance to ${next.total.toLocaleString('vi-VN')} VND.`,
    targetName: 'Số dư Đầu kỳ',
    targetLink: '/cashbook',
  });

  return computeLocalCashbookSummary(getStoredVouchers());
}

export function restoreLocalAllData() {
  localStorage.removeItem(LS_CASHBOOK_KEY);
  localStorage.removeItem(LS_OPENING_KEY);
  localStorage.removeItem(LS_IMPORT_TOKEN_KEY);
  localStorage.removeItem(LS_IMPORT_ORDERS_KEY);
  return {
    restored: true,
    message: 'Đã xóa trắng toàn bộ dữ liệu Sổ Quỹ, Dòng Tiền và Nhập Hàng',
    orderId: 0,
    syncedProductsCount: 0,
    syncedSkusCount: 0,
    summary: computeLocalCashbookSummary([]),
    totalVouchers: 0,
  };
}

export function getFallbackChartsAnalytics(): CashbookChartsAnalyticsResponse {
  const vouchers = getStoredVouchers();
  const orders = getStoredImportOrdersList();
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

  const latestOrder = orders[0]?.rawData;
  const totalImportCostVND = Number(latestOrder?.TotalPriceVND || 0);
  const productCostVND = Number(latestOrder?.PriceVND || 0);
  const buyingFeeVND = Number(latestOrder?.FeeBuyPro || 0);
  const weightFeeVND = Number(latestOrder?.FeeWeight || 0);

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
      orderId: latestOrder?.Id || 0,
      shopName: latestOrder?.ShopName || '',
      site: latestOrder?.Site || '',
      exchangeRate: latestOrder?.CurrentCNYVN || 0,
      totalPriceCNY: latestOrder?.PriceCNY || 0,
      productCostVND,
      buyingFeeVND,
      weightFeeVND,
      totalImportCostVND,
      depositPaidVND: Number(latestOrder?.Deposit || 0),
      finalPaymentVND: 0,
      totalWeightKg: Number(
        latestOrder?.TQVNWeight || latestOrder?.OrderWeight || 0,
      ),
      totalQuantity: (latestOrder?.Orders || []).reduce(
        (s, it) => s + Number(it.Quantity || 0),
        0,
      ),
      recordedRevenueVND: summary.totalIncome.total,
      recordedExpenseVND: summary.totalExpense.total,
      netProfitToDateVND:
        summary.totalIncome.total - summary.totalExpense.total,
      costBreakdown:
        totalImportCostVND > 0
          ? [
              {
                labelVi: 'Tiền hàng gốc',
                labelEn: 'Merchandise Cost',
                amount: productCostVND,
                percent: Number(
                  ((productCostVND / totalImportCostVND) * 100).toFixed(1),
                ),
              },
              {
                labelVi: 'Cước vận chuyển',
                labelEn: 'Shipping Fee',
                amount: weightFeeVND,
                percent: Number(
                  ((weightFeeVND / totalImportCostVND) * 100).toFixed(1),
                ),
              },
              {
                labelVi: 'Phí dịch vụ',
                labelEn: 'Service Fee',
                amount: buyingFeeVND,
                percent: Number(
                  ((buyingFeeVND / totalImportCostVND) * 100).toFixed(1),
                ),
              },
            ]
          : [],
      packagesBreakdown: (latestOrder?.SmallPackages || []).map((pkg) => ({
        packageId: pkg.Id,
        trackingCode: pkg.OrderTransactionCode,
        weightKg: pkg.PayableWeight || pkg.Weight,
        feeVND: pkg.TotalPrice,
        statusName: pkg.StatusName,
      })),
      itemsBreakdown: (latestOrder?.Orders || []).map((it) => ({
        itemId: it.ItemId,
        rowId: it.Id,
        nameVi: it.TitleTranslated || it.TitleOrigin,
        property: it.PropertyTranslated || it.Property,
        quantity: it.Quantity,
        unitPriceCNY: it.UPriceBuy,
        unitPriceVND: it.UPriceBuyVN,
        totalCNY: it.PriceCNY,
        totalVND: it.PriceVND,
      })),
    },
  };
}
