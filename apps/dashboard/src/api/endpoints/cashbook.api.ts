import { apiClient } from '../client';
import {
  computeLocalCashbookSummary,
  createLocalCashbookVoucher,
  deleteLocalCashbookVoucher,
  getFallbackCashbookPaginated,
  getFallbackChartsAnalytics,
  restoreLocalAllData,
  updateLocalCashbookVoucher,
  updateLocalOpeningBalance,
} from '../data/hoabinh-55479-fallback';
import {
  CashbookChartsAnalyticsResponse,
  CashbookPaginatedResponse,
  CashbookSummaryReport,
  CashbookVoucherType,
  CreateCashbookVoucherPayload,
} from '../types/cashbook.types';

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
    return getFallbackCashbookPaginated(params);
  },

  getSummary: async (
    params?: Record<string, any>,
  ): Promise<CashbookSummaryReport> => {
    return getFallbackCashbookPaginated(params).summary;
  },

  getChartsAnalytics: async (): Promise<CashbookChartsAnalyticsResponse> => {
    return getFallbackChartsAnalytics();
  },

  createVoucher: async (data: CreateCashbookVoucherPayload) => {
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
    const updated = updateLocalCashbookVoucher(id, data);
    try {
      await apiClient.patch(`/cashbook/${id}`, data);
    } catch {
      // ignore
    }
    return updated;
  },

  deleteVoucher: async (id: string) => {
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
    const updated = updateLocalOpeningBalance(data);
    try {
      await apiClient.patch('/cashbook/opening-balance', data);
    } catch {
      // ignore
    }
    return updated;
  },

  restoreDefaultData: async () => {
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
