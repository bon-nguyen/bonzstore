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
    try {
      return await apiClient.get('/cashbook', { params });
    } catch {
      return getFallbackCashbookPaginated(params);
    }
  },

  getSummary: async (
    params?: Record<string, any>,
  ): Promise<CashbookSummaryReport> => {
    try {
      return await apiClient.get('/cashbook/summary', { params });
    } catch {
      return getFallbackCashbookPaginated(params).summary;
    }
  },

  getChartsAnalytics: async (): Promise<CashbookChartsAnalyticsResponse> => {
    try {
      return await apiClient.get('/cashbook/charts');
    } catch {
      return getFallbackChartsAnalytics();
    }
  },

  createVoucher: async (data: CreateCashbookVoucherPayload) => {
    try {
      return await apiClient.post('/cashbook', data);
    } catch {
      return createLocalCashbookVoucher(data);
    }
  },

  updateVoucher: async (
    id: string,
    data: Partial<CreateCashbookVoucherPayload>,
  ) => {
    try {
      return await apiClient.patch(`/cashbook/${id}`, data);
    } catch {
      return updateLocalCashbookVoucher(id, data);
    }
  },

  deleteVoucher: async (id: string) => {
    try {
      return await apiClient.delete(`/cashbook/${id}`);
    } catch {
      return deleteLocalCashbookVoucher(id);
    }
  },

  updateOpeningBalance: async (data: {
    cash: number;
    card: number;
    transfer: number;
  }): Promise<CashbookSummaryReport> => {
    try {
      return await apiClient.patch('/cashbook/opening-balance', data);
    } catch {
      return updateLocalOpeningBalance(data);
    }
  },

  restoreDefaultData: async () => {
    try {
      return await apiClient.post('/cashbook/restore');
    } catch {
      return restoreLocalAllData();
    }
  },
};

export { computeLocalCashbookSummary };
