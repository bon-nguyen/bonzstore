export type CashbookVoucherType = 'INCOME' | 'EXPENSE';

export type CashbookPayerGroup = 'PARTNER' | 'CUSTOMER' | 'STAFF' | 'OTHER';

export interface CashbookSourceCategoryItem {
  id: string;
  type: CashbookVoucherType;
  code: string; // Mã nguồn thu / Mã khoản chi (required)
  name: string; // Tên nguồn thu / Tên khoản chi (required)
  description: string; // Mô tả nguồn thu / Mô tả khoản chi
  createdAt: string;
  updatedAt: string;
}

export interface CreateCashbookSourceCategoryPayload {
  type: CashbookVoucherType;
  code: string;
  name: string;
  description?: string;
}

export type UpdateCashbookSourceCategoryPayload =
  Partial<CreateCashbookSourceCategoryPayload>;

export interface CashbookOperatorTokenInfo {
  userId: string;
  email: string;
  fullName: string;
  roleCode: string;
  tokenMasked?: string;
}

export interface CashbookChannelBreakdown {
  total: number;
  cash: number;
  card: number;
  transfer: number;
}

export interface CashbookSummaryReport {
  openingBalance: CashbookChannelBreakdown;
  totalIncome: CashbookChannelBreakdown;
  totalExpense: CashbookChannelBreakdown;
  closingBalance: CashbookChannelBreakdown;
  voucherCounts: {
    total: number;
    incomeCount: number;
    expenseCount: number;
  };
}

export interface CashbookVoucherItem {
  id: string;
  voucherCode: string;
  transactionDate: string;
  type: CashbookVoucherType;
  category: string; // Tên loại phiếu thu / chi
  categoryCode?: string; // Mã nguồn thu / khoản chi
  content: string;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  totalAmount: number;
  payerGroup?: CashbookPayerGroup; // Nhóm người nộp / nhận
  partnerName: string; // Tên người nộp / nhận
  staffName: string; // Người thu / chi (từ hệ thống)
  isBusinessAccounting?: boolean; // Hạch toán kết quả kinh doanh
  operatorTokenInfo?: CashbookOperatorTokenInfo; // Lưu bằng token người thao tác
  importOrderId: number | null;
  externalPaymentId: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashbookPaginatedResponse {
  data: CashbookVoucherItem[];
  summary: CashbookSummaryReport;
  categories: string[];
  sourceCategories?: CashbookSourceCategoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateCashbookVoucherPayload {
  type: CashbookVoucherType;
  voucherCode?: string;
  transactionDate?: string;
  category: string;
  categoryCode?: string;
  content?: string;
  cashAmount?: number;
  cardAmount?: number;
  transferAmount?: number;
  payerGroup?: CashbookPayerGroup;
  partnerName: string;
  staffName?: string;
  isBusinessAccounting?: boolean;
  operatorTokenInfo?: CashbookOperatorTokenInfo;
  importOrderId?: number;
  note?: string;
}

export interface CashbookChartsAnalyticsResponse {
  summary: CashbookSummaryReport;
  timelineSeries: Array<{
    date: string;
    income: number;
    expense: number;
    incomeCash: number;
    incomeCard: number;
    incomeTransfer: number;
    expenseCash: number;
    expenseCard: number;
    expenseTransfer: number;
    voucherCount: number;
    netFlow: number;
    closingBalance: number;
  }>;
  paymentChannels: Array<{
    channel: 'CASH' | 'CARD' | 'TRANSFER';
    labelVi: string;
    labelEn: string;
    opening: number;
    income: number;
    expense: number;
    closing: number;
  }>;
  incomeByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  expenseByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  order55479Analytics: {
    orderId: number;
    shopName: string;
    site: string;
    exchangeRate: number;
    totalPriceCNY: number;
    productCostVND: number;
    buyingFeeVND: number;
    weightFeeVND: number;
    totalImportCostVND: number;
    depositPaidVND: number;
    finalPaymentVND: number;
    totalWeightKg: number;
    totalQuantity: number;
    recordedRevenueVND: number;
    recordedExpenseVND: number;
    netProfitToDateVND: number;
    costBreakdown: Array<{
      labelVi: string;
      labelEn: string;
      amount: number;
      percent: number;
    }>;
    packagesBreakdown: Array<{
      packageId: number;
      trackingCode: string;
      weightKg: string;
      feeVND: string;
      statusName: string;
    }>;
    itemsBreakdown: Array<{
      itemId: string;
      rowId: number;
      nameVi: string;
      property: string;
      quantity: number;
      unitPriceCNY: number;
      unitPriceVND: number;
      totalCNY: number;
      totalVND: number;
    }>;
  };
}
