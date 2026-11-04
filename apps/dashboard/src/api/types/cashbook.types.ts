export type CashbookVoucherType = 'INCOME' | 'EXPENSE';

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
  category: string;
  content: string;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  totalAmount: number;
  partnerName: string; // Người nhận, Nộp
  staffName: string; // Người thu Chi
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
  content: string;
  cashAmount?: number;
  cardAmount?: number;
  transferAmount?: number;
  partnerName: string;
  staffName?: string;
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
      weightKg: number;
      feeVND: number;
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

