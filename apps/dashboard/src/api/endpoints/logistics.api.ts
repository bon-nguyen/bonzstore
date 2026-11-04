import { apiClient } from '../client';
import {
  CreateLogisticsUnitPayload,
  LogisticsListResponse,
  LogisticsUnit,
  UpdateLogisticsUnitPayload,
} from '../types/logistics.types';

const LS_LOGISTICS_UNITS_KEY = 'bonzstore_logistics_units_clean_v1';

function getLocalLogisticsUnits(): LogisticsUnit[] {
  try {
    const raw = localStorage.getItem(LS_LOGISTICS_UNITS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalLogisticsUnits(units: LogisticsUnit[]): void {
  try {
    localStorage.setItem(LS_LOGISTICS_UNITS_KEY, JSON.stringify(units));
  } catch {
    // ignore
  }
}

function buildLocalPaginatedResponse(
  units: LogisticsUnit[],
  params?: {
    search?: string;
    page?: number;
    limit?: number;
  },
): LogisticsListResponse {
  const page = Math.max(Number(params?.page || 1), 1);
  const limit = Math.max(Number(params?.limit || 20), 1);
  const q = (params?.search || '').trim().toLowerCase();

  const sorted = [...units].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const filtered = q
    ? sorted.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.shortName || '').toLowerCase().includes(q) ||
          (u.address || '').toLowerCase().includes(q) ||
          (u.phone || '').toLowerCase().includes(q) ||
          (u.gmail || '').toLowerCase().includes(q),
      )
    : sorted;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    totalCount: units.length,
    filteredCount: total,
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

export const logisticsApi = {
  getAll: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<LogisticsListResponse> => {
    try {
      const res: any = await apiClient.get('/logistics', { params });
      if (res && Array.isArray(res.data)) {
        return res as LogisticsListResponse;
      }
      return buildLocalPaginatedResponse(getLocalLogisticsUnits(), params);
    } catch {
      return buildLocalPaginatedResponse(getLocalLogisticsUnits(), params);
    }
  },

  create: async (payload: CreateLogisticsUnitPayload): Promise<LogisticsUnit> => {
    const cleanPayload: CreateLogisticsUnitPayload = {
      name: (payload.name || '').trim(),
      shortName: (payload.shortName || '').trim(),
      avatarUrl: (payload.avatarUrl || '').trim(),
      address: (payload.address || '').trim(),
      phone: (payload.phone || '').trim(),
      gmail: (payload.gmail || '').trim(),
      isHidden: Boolean(payload.isHidden),
    };

    try {
      const res: any = await apiClient.post('/logistics', cleanPayload);
      if (res && res.id) {
        const list = getLocalLogisticsUnits();
        saveLocalLogisticsUnits([
          res as LogisticsUnit,
          ...list.filter((i) => i.id !== res.id),
        ]);
        return res as LogisticsUnit;
      }
    } catch {
      // Fallback to local storage
    }

    const now = new Date().toISOString();
    const newItem: LogisticsUnit = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanPayload.name,
      shortName: cleanPayload.shortName || '',
      avatarUrl: cleanPayload.avatarUrl || '',
      address: cleanPayload.address || '',
      phone: cleanPayload.phone || '',
      gmail: cleanPayload.gmail || '',
      isHidden: Boolean(cleanPayload.isHidden),
      createdAt: now,
      updatedAt: now,
    };

    const current = getLocalLogisticsUnits();
    saveLocalLogisticsUnits([newItem, ...current]);
    return newItem;
  },

  update: async (
    id: string,
    payload: UpdateLogisticsUnitPayload,
  ): Promise<LogisticsUnit> => {
    const cleanPayload: UpdateLogisticsUnitPayload = {
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.shortName !== undefined
        ? { shortName: payload.shortName.trim() }
        : {}),
      ...(payload.avatarUrl !== undefined
        ? { avatarUrl: payload.avatarUrl.trim() }
        : {}),
      ...(payload.address !== undefined
        ? { address: payload.address.trim() }
        : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone.trim() } : {}),
      ...(payload.gmail !== undefined ? { gmail: payload.gmail.trim() } : {}),
      ...(payload.isHidden !== undefined
        ? { isHidden: Boolean(payload.isHidden) }
        : {}),
    };

    try {
      const res: any = await apiClient.patch(`/logistics/${id}`, cleanPayload);
      if (res && res.id) {
        const list = getLocalLogisticsUnits();
        const next = list.map((item) =>
          item.id === id ? (res as LogisticsUnit) : item,
        );
        saveLocalLogisticsUnits(next);
        return res as LogisticsUnit;
      }
    } catch {
      // Fallback to local storage
    }

    const list = getLocalLogisticsUnits();
    const idx = list.findIndex((i) => i.id === id);
    const now = new Date().toISOString();
    if (idx === -1) {
      throw new Error('Không tìm thấy đơn vị Logistics cần chỉnh sửa');
    }
    const updated: LogisticsUnit = {
      ...list[idx],
      ...cleanPayload,
      updatedAt: now,
    };
    list[idx] = updated;
    saveLocalLogisticsUnits(list);
    return updated;
  },

  delete: async (id: string): Promise<{ deleted: boolean; id: string }> => {
    try {
      await apiClient.delete(`/logistics/${id}`);
    } catch {
      // Fallback to local storage
    }
    const list = getLocalLogisticsUnits().filter((i) => i.id !== id);
    saveLocalLogisticsUnits(list);
    return { deleted: true, id };
  },
};
