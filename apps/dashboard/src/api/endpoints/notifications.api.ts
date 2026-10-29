import { apiClient } from '../client';
import {
  AdminNotificationItem,
  CreateTestNotificationInput,
  NotificationQueryParams,
  NotificationSettings,
  NotificationStats,
  PaginatedNotificationsResponse,
  UpdateNotificationSettingsInput,
} from '../types/notification.types';

export const notificationsApi = {
  getPaginated: (
    params?: NotificationQueryParams,
  ): Promise<PaginatedNotificationsResponse> =>
    apiClient.get('/notifications', { params }),

  getStats: (): Promise<NotificationStats> =>
    apiClient.get('/notifications/stats'),

  getSettings: (): Promise<NotificationSettings> =>
    apiClient.get('/notifications/settings'),

  updateSettings: (
    data: UpdateNotificationSettingsInput,
  ): Promise<NotificationSettings> =>
    apiClient.patch('/notifications/settings', data),

  resetSettings: (): Promise<NotificationSettings> =>
    apiClient.post('/notifications/settings/reset'),

  createTest: (
    data: CreateTestNotificationInput,
  ): Promise<AdminNotificationItem> =>
    apiClient.post('/notifications/test', data),

  markAsRead: (
    id: string,
    isRead = true,
  ): Promise<AdminNotificationItem> =>
    apiClient.patch(`/notifications/${id}/read`, { isRead }),

  markAllAsRead: (): Promise<{
    updatedCount: number;
    stats: NotificationStats;
  }> => apiClient.post('/notifications/read-all'),

  clearRead: (): Promise<{
    deletedCount: number;
    stats: NotificationStats;
  }> => apiClient.delete('/notifications/clear-read'),

  remove: (
    id: string,
  ): Promise<{
    deletedId: string;
    stats: NotificationStats;
  }> => apiClient.delete(`/notifications/${id}`),
};
