// lib/api/notification.ts - Notification service

import { apiClient } from './client';
import type {
  NotificationDTO,
  SendNotificationRequest,
  PageResponseNotificationDTO,
  ApiResponseNotificationDTO,
  ApiResponsePageResponseNotificationDTO,
  ApiResponseListNotificationDTO,
  ApiResponseLong,
  ApiResponseVoid,
  Pageable
} from '../api/types';

export const notificationService = {
  /**
   * Get my notifications (paginated)
   */
  async getMyNotifications(pageable: Pageable = { page: 0, size: 10 }): Promise<PageResponseNotificationDTO> {
    const params = new URLSearchParams();
    if (pageable.page !== undefined) params.append('page', pageable.page.toString());
    if (pageable.size !== undefined) params.append('size', pageable.size.toString());
    if (pageable.sort) {
      pageable.sort.forEach((s: string) => params.append('sort', s));
    }
    const response = await apiClient.get<ApiResponsePageResponseNotificationDTO>(`/api/notifications/my?${params.toString()}`);
    return response.data!;
  },

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<NotificationDTO[]> {
    const response = await apiClient.get<ApiResponseListNotificationDTO>('/api/notifications/my/unread');
    return response.data!;
  },

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponseLong>('/api/notifications/my/unread/count');
    return response.data!;
  },

  /**
   * Get a specific notification by ID
   */
  async getNotification(id: string): Promise<NotificationDTO> {
    const response = await apiClient.get<ApiResponseNotificationDTO>(`/api/notifications/${id}`);
    return response.data!;
  },

  /**
   * Send a notification (Admin/System use)
   */
  async sendNotification(requestBody: SendNotificationRequest): Promise<NotificationDTO> {
    const response = await apiClient.post<ApiResponseNotificationDTO>('/api/notifications', requestBody);
    return response.data!;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await apiClient.put<ApiResponseVoid>(`/api/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put<ApiResponseVoid>('/api/notifications/my/read-all');
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete<ApiResponseVoid>(`/api/notifications/${id}`);
  }
};
