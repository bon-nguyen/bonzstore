import { PaginatedResponse } from './auth.types';
import { SortOrder } from './user.types';

export type NotificationAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type NotificationModuleType =
  | 'PRODUCTS'
  | 'CATEGORIES'
  | 'TAGS'
  | 'USERS'
  | 'ROLES';

export type NotificationSortField = 'createdAt' | 'module' | 'action';

export interface NotificationModulePreference {
  CREATE: boolean;
  UPDATE: boolean;
  DELETE: boolean;
}

export interface NotificationSettings {
  masterEnabled: boolean;
  showToastOnEvent: boolean;
  onlyAdminActions: boolean;
  retentionDays: number;
  modules: Record<NotificationModuleType, NotificationModulePreference>;
  updatedAt: string;
  updatedBy?: string;
}

export interface AdminNotificationItem {
  id: string;
  module: NotificationModuleType;
  action: NotificationAction;
  titleVi: string;
  titleEn: string;
  messageVi: string;
  messageEn: string;
  targetName: string;
  targetLink: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unreadCount: number;
  readCount: number;
  byAction: Record<NotificationAction, number>;
  byModule: Record<NotificationModuleType, number>;
}

export interface PaginatedNotificationsResponse {
  data: AdminNotificationItem[];
  meta: PaginatedResponse<AdminNotificationItem>['meta'] & {
    sortBy?: NotificationSortField;
    sortOrder?: SortOrder;
  };
  stats: NotificationStats;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  module?: 'ALL' | NotificationModuleType;
  action?: 'ALL' | NotificationAction;
  readStatus?: 'ALL' | 'UNREAD' | 'READ';
  sortBy?: NotificationSortField;
  sortOrder?: SortOrder;
}

export interface UpdateNotificationSettingsInput {
  masterEnabled?: boolean;
  showToastOnEvent?: boolean;
  onlyAdminActions?: boolean;
  retentionDays?: number;
  modules?: Partial<
    Record<
      NotificationModuleType,
      Partial<Record<NotificationAction, boolean>>
    >
  >;
}

export interface CreateTestNotificationInput {
  module?: NotificationModuleType;
  action?: NotificationAction;
  customTargetName?: string;
}

