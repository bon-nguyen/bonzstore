import { apiClient } from '../client';
import {
  clearReadLocalNotifications,
  getLocalNotifications,
  markAllLocalNotificationsRead,
  markLocalNotificationRead,
  recordLocalNotification,
  removeLocalNotification,
} from '../data/hoabinh-55479-fallback';
import {
  AdminNotificationItem,
  CreateTestNotificationInput,
  NotificationAction,
  NotificationModuleType,
  NotificationQueryParams,
  NotificationSettings,
  NotificationStats,
  PaginatedNotificationsResponse,
  UpdateNotificationSettingsInput,
} from '../types/notification.types';

function computeStatsFromList(
  items: AdminNotificationItem[],
): NotificationStats {
  const total = items.length;
  const unreadCount = items.filter((n) => !n.isRead).length;
  const readCount = total - unreadCount;

  const byAction: Record<NotificationAction, number> = {
    CREATE: 0,
    UPDATE: 0,
    DELETE: 0,
  };

  const byModule: Record<NotificationModuleType, number> = {
    PRODUCTS: 0,
    CATEGORIES: 0,
    TAGS: 0,
    USERS: 0,
    ROLES: 0,
  };

  for (const item of items) {
    byAction[item.action] = (byAction[item.action] || 0) + 1;
    byModule[item.module] = (byModule[item.module] || 0) + 1;
  }

  return {
    total,
    unreadCount,
    readCount,
    byAction,
    byModule,
  };
}

function mergeLocalAndBackendNotifications(
  localItems: AdminNotificationItem[],
  backendItems: AdminNotificationItem[],
): AdminNotificationItem[] {
  const dedupedBackend = backendItems.filter((b) => {
    const bTime = new Date(b.createdAt).getTime();
    return !localItems.some(
      (l) =>
        l.action === b.action &&
        l.targetName === b.targetName &&
        Math.abs(new Date(l.createdAt).getTime() - bTime) < 15000,
    );
  });

  return [...localItems, ...dedupedBackend];
}

export const notificationsApi = {
  getPaginated: async (
    params?: NotificationQueryParams,
  ): Promise<PaginatedNotificationsResponse> => {
    let backendItems: AdminNotificationItem[] = [];
    try {
      const res = await apiClient.get<
        any,
        PaginatedNotificationsResponse
      >('/notifications', {
        params: { page: 1, limit: 100 },
      });
      backendItems = res?.data || [];
    } catch {
      backendItems = [];
    }

    const localItems = getLocalNotifications();
    const allMerged = mergeLocalAndBackendNotifications(
      localItems,
      backendItems,
    );
    const stats = computeStatsFromList(allMerged);

    let filtered = [...allMerged];

    if (params?.module && params.module !== 'ALL') {
      filtered = filtered.filter((n) => n.module === params.module);
    }

    if (params?.action && params.action !== 'ALL') {
      filtered = filtered.filter((n) => n.action === params.action);
    }

    if (params?.readStatus === 'UNREAD') {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (params?.readStatus === 'READ') {
      filtered = filtered.filter((n) => n.isRead);
    }

    if (params?.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.titleVi.toLowerCase().includes(q) ||
          n.titleEn.toLowerCase().includes(q) ||
          n.messageVi.toLowerCase().includes(q) ||
          n.messageEn.toLowerCase().includes(q) ||
          n.targetName.toLowerCase().includes(q) ||
          n.actorName.toLowerCase().includes(q) ||
          n.actorEmail.toLowerCase().includes(q),
      );
    }

    const sortBy = params?.sortBy || 'createdAt';
    const sortOrder = params?.sortOrder === 'asc' ? 'asc' : 'desc';
    const dir = sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      if (sortBy === 'module') {
        const cmp = a.module.localeCompare(b.module) * dir;
        if (cmp !== 0) return cmp;
      } else if (sortBy === 'action') {
        const cmp = a.action.localeCompare(b.action) * dir;
        if (cmp !== 0) return cmp;
      }
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        dir
      );
    });

    const page = Math.max(Number(params?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(params?.limit) || 10, 1), 100);
    const total = filtered.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      meta: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
        sortBy,
        sortOrder,
      },
      stats,
    };
  },

  getStats: async (): Promise<NotificationStats> => {
    const res = await notificationsApi.getPaginated({ page: 1, limit: 1 });
    return res.stats;
  },

  getSettings: async (): Promise<NotificationSettings> => {
    try {
      return await apiClient.get('/notifications/settings');
    } catch {
      return {
        masterEnabled: true,
        showToastOnEvent: true,
        onlyAdminActions: true,
        retentionDays: 30,
        modules: {
          PRODUCTS: { CREATE: true, UPDATE: true, DELETE: true },
          CATEGORIES: { CREATE: true, UPDATE: true, DELETE: true },
          TAGS: { CREATE: true, UPDATE: true, DELETE: true },
          USERS: { CREATE: true, UPDATE: true, DELETE: true },
          ROLES: { CREATE: true, UPDATE: true, DELETE: true },
        },
        updatedAt: new Date().toISOString(),
      };
    }
  },

  updateSettings: (
    data: UpdateNotificationSettingsInput,
  ): Promise<NotificationSettings> =>
    apiClient.patch('/notifications/settings', data),

  resetSettings: (): Promise<NotificationSettings> =>
    apiClient.post('/notifications/settings/reset'),

  createTest: async (
    data: CreateTestNotificationInput,
  ): Promise<AdminNotificationItem> => {
    try {
      return await apiClient.post('/notifications/test', data);
    } catch {
      return recordLocalNotification({
        module: data.module || 'PRODUCTS',
        action: data.action || 'CREATE',
        titleVi: `[Test] Thông báo kiểm thử (${data.action || 'CREATE'})`,
        titleEn: `[Test] Test Notification (${data.action || 'CREATE'})`,
        messageVi: `Thông báo kiểm thử phân hệ ${data.module || 'PRODUCTS'}.`,
        messageEn: `Test notification for module ${data.module || 'PRODUCTS'}.`,
        targetName: data.customTargetName || 'Test Item',
        targetLink: '/cashbook',
      });
    }
  },

  markAsRead: async (
    id: string,
    isRead = true,
  ): Promise<AdminNotificationItem> => {
    const localUpdated = markLocalNotificationRead(id, isRead);
    if (localUpdated) {
      return localUpdated;
    }
    return apiClient.patch(`/notifications/${id}/read`, { isRead });
  },

  markAllAsRead: async (): Promise<{
    updatedCount: number;
    stats: NotificationStats;
  }> => {
    const localCount = markAllLocalNotificationsRead();
    let apiCount = 0;
    try {
      const res = await apiClient.post<
        any,
        { updatedCount: number; stats: NotificationStats }
      >('/notifications/read-all');
      apiCount = res?.updatedCount || 0;
    } catch {
      // ignore
    }
    const stats = await notificationsApi.getStats();
    return {
      updatedCount: localCount + apiCount,
      stats,
    };
  },

  clearRead: async (): Promise<{
    deletedCount: number;
    stats: NotificationStats;
  }> => {
    const localDeleted = clearReadLocalNotifications();
    let apiDeleted = 0;
    try {
      const res = await apiClient.delete<
        any,
        { deletedCount: number; stats: NotificationStats }
      >('/notifications/clear-read');
      apiDeleted = res?.deletedCount || 0;
    } catch {
      // ignore
    }
    const stats = await notificationsApi.getStats();
    return {
      deletedCount: localDeleted + apiDeleted,
      stats,
    };
  },

  remove: async (
    id: string,
  ): Promise<{
    deletedId: string;
    stats: NotificationStats;
  }> => {
    const removedLocal = removeLocalNotification(id);
    if (!removedLocal) {
      try {
        await apiClient.delete(`/notifications/${id}`);
      } catch {
        // ignore
      }
    }
    const stats = await notificationsApi.getStats();
    return {
      deletedId: id,
      stats,
    };
  },
};
