import { apiClient } from '../client';
import {
  computeLocalCashbookSummary,
  createLocalCashbookVoucher,
  createLocalSourceCategory,
  deleteLocalCashbookVoucher,
  deleteLocalSourceCategory,
  getFallbackCashbookPaginated,
  getFallbackChartsAnalytics,
  getLocalSourceCategories,
  restoreLocalAllData,
  updateLocalCashbookVoucher,
  updateLocalOpeningBalance,
  updateLocalSourceCategory,
} from '../data/hoabinh-55479-fallback';
import {
  CashbookChartsAnalyticsResponse,
  CashbookPaginatedResponse,
  CashbookSourceCategoryItem,
  CashbookSummaryReport,
  CashbookVoucherType,
  CreateCashbookSourceCategoryPayload,
  CreateCashbookVoucherPayload,
  UpdateCashbookSourceCategoryPayload,
} from '../types/cashbook.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const cashbookApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'ALL' | CashbookVoucherType;
    category?: string;
    paymentChannel?: 'ALL' | 'CASH' | 'CARD' | 'TRANSFER';
    startDate?: string;
    endDate?: string;
    importOrderId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<CashbookPaginatedResponse> => {
    await delay(180);
    return getFallbackCashbookPaginated(params);
  },

  getSummary: async (
    params?: Record<string, any>,
  ): Promise<CashbookSummaryReport> => {
    await delay(150);
    return getFallbackCashbookPaginated(params).summary;
  },

  getChartsAnalytics: async (): Promise<CashbookChartsAnalyticsResponse> => {
    await delay(180);
    return getFallbackChartsAnalytics();
  },

  getSourceCategories: async (
    type?: CashbookVoucherType,
  ): Promise<CashbookSourceCategoryItem[]> => {
    return getLocalSourceCategories(type);
  },

  createSourceCategory: async (
    data: CreateCashbookSourceCategoryPayload,
  ): Promise<CashbookSourceCategoryItem> => {
    await delay(350);
    const created = createLocalSourceCategory(data);
    try {
      await apiClient.post('/cashbook/source-categories', data);
    } catch {
      // ignore
    }
    return created;
  },

  updateSourceCategory: async (
    id: string,
    data: UpdateCashbookSourceCategoryPayload,
  ): Promise<CashbookSourceCategoryItem> => {
    await delay(350);
    const updated = updateLocalSourceCategory(id, data);
    try {
      await apiClient.patch(`/cashbook/source-categories/${id}`, data);
    } catch {
      // ignore
    }
    return updated;
  },

  deleteSourceCategory: async (id: string) => {
    await delay(300);
    const deleted = deleteLocalSourceCategory(id);
    try {
      await apiClient.delete(`/cashbook/source-categories/${id}`);
    } catch {
      // ignore
    }
    return deleted;
  },

  createVoucher: async (data: CreateCashbookVoucherPayload) => {
    await delay(380);
    const created = createLocalCashbookVoucher(data);
    try {
      await apiClient.post('/cashbook', data);
    } catch {
      // ignore
    }
    return created;
  },

  updateVoucher: async (
    id: string,
    data: Partial<CreateCashbookVoucherPayload>,
  ) => {
    await delay(380);
    const updated = updateLocalCashbookVoucher(id, data);
    try {
      await apiClient.patch(`/cashbook/${id}`, data);
    } catch {
      // ignore
    }
    return updated;
  },

  deleteVoucher: async (id: string) => {
    await delay(350);
    const deleted = deleteLocalCashbookVoucher(id);
    try {
      await apiClient.delete(`/cashbook/${id}`);
    } catch {
      // ignore
    }
    return deleted;
  },

  updateOpeningBalance: async (data: {
    cash: number;
    card: number;
    transfer: number;
  }): Promise<CashbookSummaryReport> => {
    await delay(380);
    const updated = updateLocalOpeningBalance(data);
    try {
      await apiClient.patch('/cashbook/opening-balance', data);
    } catch {
      // ignore
    }
    return updated;
  },

  restoreDefaultData: async () => {
    await delay(400);
    const cleared = restoreLocalAllData();
    try {
      await apiClient.post('/cashbook/restore');
    } catch {
      // ignore
    }
    return cleared;
  },
};

export { computeLocalCashbookSummary };
