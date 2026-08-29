import { api } from './client'
import type { Notification } from '@/types/api'

export const notificationsApi = {
  /** Newest first. Omitting userId returns the feed belonging to the caller. */
  list: (userId?: number, signal?: AbortSignal) =>
    api.get<Notification[]>(
      userId ? `/api/notifications?userId=${userId}` : '/api/notifications',
      signal,
    ),

  markAsRead: (notificationId: number) =>
    api.put<Notification>(`/api/notifications/${notificationId}/read`),
}
