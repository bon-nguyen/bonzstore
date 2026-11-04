import { apiClient } from '../client';
import {
  decodeHoabinhJwt,
  deleteStoredImportOrderRecord,
  getFallbackImportsPaginated,
  getStoredImportTokenConfig,
  HOABINH_ORDER_55479_DATA,
  HOABINH_REAL_JWT_TOKEN,
  loginHoabinhFallback,
  restoreLocalAllData,
  saveStoredImportOrderRecord,
  saveStoredImportTokenConfig,
  simulateLocalTokenExpired401,
  updateLocalOrderWorkflowTab,
} from '../data/hoabinh-55479-fallback';
import {
  FetchExternalOrderPayload,
  HoabinhLoginPayload,
  HoabinhLoginResponse,
  ImportOrdersPaginatedResponse,
  ImportOrderStats,
  ImportOrderTabType,
  ImportTokenConfig,
  StoredImportOrderRecord,
} from '../types/imports.types';

export const importsApi = {
  loginHoabinh: async (
    payload: HoabinhLoginPayload,
  ): Promise<HoabinhLoginResponse> => {
    try {
      const res: any = await apiClient.post(
        '/imports/authenticate/login',
        payload,
      );
      const token =
        res?.Data?.token || payload.customToken?.trim() || '';
      const localRes = loginHoabinhFallback({
        ...payload,
        customToken: token,
      });
      return {
        ...localRes,
        ...res,
        Data: { token },
        decoded: localRes.decoded,
        tokenConfig: localRes.tokenConfig,
      };
    } catch {
      return loginHoabinhFallback(payload);
    }
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    PageIndex?: number;
    PageSize?: number;
    OrderBy?: string;
    UID?: number;
    OrderType?: number;
    tab?: ImportOrderTabType;
    search?: string;
    status?: string;
    site?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ImportOrdersPaginatedResponse> => {
    return getFallbackImportsPaginated(params);
  },

  getById: async (id: number): Promise<StoredImportOrderRecord | null> => {
    const all = getFallbackImportsPaginated({ page: 1, limit: 100 }).data;
    return all.find((r) => r.id === id) || null;
  },

  getStats: async (): Promise<ImportOrderStats> => {
    return getFallbackImportsPaginated().stats;
  },

  getTokenConfig: async (): Promise<ImportTokenConfig> => {
    return getStoredImportTokenConfig();
  },

  saveTokenConfig: async (data: {
    token: string;
    accountUsername?: string;
    loginUrl?: string;
    apiBaseUrl?: string;
  }): Promise<ImportTokenConfig> => {
    const savedLocal = saveStoredImportTokenConfig(
      data.token,
      data.accountUsername,
    );
    try {
      await apiClient.post('/imports/token', data);
    } catch {
      // ignore
    }
    return savedLocal;
  },

  simulateTokenExpired401: async (): Promise<ImportTokenConfig> => {
    return simulateLocalTokenExpired401();
  },

  updateWorkflowTab: async (
    orderId: number,
    targetTab: ImportOrderTabType,
  ): Promise<{
    orderId: number;
    targetTab: ImportOrderTabType;
    orderType: number;
    syncedToCatalog: boolean;
  }> => {
    updateLocalOrderWorkflowTab(orderId, targetTab);
    const orderType =
      targetTab === 'DRAFT' ? 0 : targetTab === 'APPROVED' ? 2 : 1;
    return {
      orderId,
      targetTab,
      orderType,
      syncedToCatalog: targetTab === 'APPROVED',
    };
  },

  fetchExternalOrder: async (data: FetchExternalOrderPayload) => {
    // Nếu người dùng dán JSON thật hoặc gọi API thật khi đã có Token
    if (data.rawJson?.trim()) {
      const parsed = JSON.parse(data.rawJson.trim());
      const candidate = parsed?.Data || parsed?.data || parsed;
      if (candidate && candidate.Id) {
        const record: StoredImportOrderRecord = {
          id: Number(candidate.Id),
          orderCode:
            candidate.MainOrderCodes?.[0]?.Code ||
            candidate.MainOrderCode ||
            String(candidate.Id),
          sourceUrl:
            data.orderIdOrUrl ||
            `https://hoabinhlogistics.com/api/main-order/${candidate.Id}`,
          workflowTab: data.targetTab || 'CURRENT',
          orderTypeParam:
            data.targetTab === 'DRAFT'
              ? 0
              : data.targetTab === 'APPROVED'
                ? 2
                : 1,
          approvedAt:
            data.targetTab === 'APPROVED' ? new Date().toISOString() : null,
          approvedBy: null,
          syncedToCatalog: Boolean(data.autoSyncProducts),
          syncedToCashbook: Boolean(data.autoSyncCashbook),
          lastSyncedAt: new Date().toISOString(),
          syncedProductIds: [],
          rawData: candidate,
        };
        saveStoredImportOrderRecord(record);
        return {
          Success: true,
          Data: candidate,
          syncMeta: {
            sourceMode: 'LIVE_HOABINH_API',
          },
        };
      }
    }

    const res: any = await apiClient.post('/imports/fetch-order', data);
    if (res?.Data?.Id) {
      saveStoredImportOrderRecord({
        id: Number(res.Data.Id),
        orderCode:
          res.Data.MainOrderCodes?.[0]?.Code ||
          res.Data.MainOrderCode ||
          String(res.Data.Id),
        sourceUrl:
          data.orderIdOrUrl ||
          `https://hoabinhlogistics.com/api/main-order/${res.Data.Id}`,
        workflowTab: data.targetTab || 'CURRENT',
        orderTypeParam:
          data.targetTab === 'DRAFT'
            ? 0
            : data.targetTab === 'APPROVED'
              ? 2
              : 1,
        approvedAt:
          data.targetTab === 'APPROVED' ? new Date().toISOString() : null,
        approvedBy: null,
        syncedToCatalog: Boolean(data.autoSyncProducts),
        syncedToCashbook: Boolean(data.autoSyncCashbook),
        lastSyncedAt: new Date().toISOString(),
        syncedProductIds: [],
        rawData: res.Data,
      });
    }
    return res;
  },

  syncToCatalog: async (
    orderId: number,
    data?: {
      priceMarkupMultiplier?: number;
      categoryId?: string;
    },
  ): Promise<{
    orderId: number;
    syncedProductsCount: number;
    syncedSkusCount: number;
    syncedProductIds: string[];
  }> => {
    updateLocalOrderWorkflowTab(orderId, 'APPROVED');
    try {
      return await apiClient.post(
        `/imports/${orderId}/sync-catalog`,
        data || {},
      );
    } catch {
      return {
        orderId,
        syncedProductsCount: 0,
        syncedSkusCount: 0,
        syncedProductIds: [],
      };
    }
  },

  restoreDefaultData: async (): Promise<{
    restored: boolean;
    message: string;
    orderId: number;
    syncedProductsCount: number;
    syncedSkusCount: number;
  }> => {
    const localCleared = restoreLocalAllData();
    try {
      await apiClient.post('/imports/restore');
    } catch {
      // ignore
    }
    return localCleared;
  },
};

export {
  decodeHoabinhJwt,
  deleteStoredImportOrderRecord,
  HOABINH_ORDER_55479_DATA,
  HOABINH_REAL_JWT_TOKEN,
  saveStoredImportOrderRecord,
};
