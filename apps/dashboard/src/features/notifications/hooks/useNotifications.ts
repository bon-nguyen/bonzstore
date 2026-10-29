import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationsApi } from '../../../api/endpoints/notifications.api';
import {
  CreateTestNotificationInput,
  NotificationQueryParams,
  UpdateNotificationSettingsInput,
} from '../../../api/types/notification.types';
import { getErrorMessage } from '../../../lib/utils';
import { translateStatic } from '../../i18n/I18nContext';

export function usePaginatedNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: ['notifications', 'paginated', params],
    queryFn: () => notificationsApi.getPaginated(params),
    placeholderData: keepPreviousData,
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: () => notificationsApi.getStats(),
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notifications', 'settings'],
    queryFn: () => notificationsApi.getSettings(),
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateNotificationSettingsInput) =>
      notificationsApi.updateSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(translateStatic('api.notificationSettingsSaved'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, translateStatic('api.networkError')));
    },
  });
}

export function useResetNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.resetSettings(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(translateStatic('api.notificationSettingsReset'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, translateStatic('api.networkError')));
    },
  });
}

export function useCreateTestNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTestNotificationInput) =>
      notificationsApi.createTest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(translateStatic('api.notificationTestSent'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, translateStatic('api.networkError')));
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead?: boolean }) =>
      notificationsApi.markAsRead(id, isRead ?? true),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(translateStatic('api.notificationReadAll'));
    },
  });
}

export function useClearReadNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.clearRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(translateStatic('api.notificationCleared'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, translateStatic('api.networkError')));
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(translateStatic('api.notificationDeleted'));
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, translateStatic('api.networkError')));
    },
  });
}
