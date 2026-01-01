import {
  ApiResponse,
  NotificationDTO,
  PageResponse,
  SendNotificationRequest,
  Pageable
} from '../types/notification.types';

// Configuration: Adjust base URL as needed or import from environment config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper to handle native fetch requests
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

export const NotificationService = {
  /**
   * Get my notifications (paginated)
   */
  getMyNotifications: async (pageable: Pageable = { page: 0, size: 10 }) => {
    const params = new URLSearchParams();
    if (pageable.page !== undefined) params.append('page', pageable.page.toString());
    if (pageable.size !== undefined) params.append('size', pageable.size.toString());
    if (pageable.sort) {
      pageable.sort.forEach(s => params.append('sort', s));
    }
    return request<ApiResponse<PageResponse<NotificationDTO>>>(`/api/notifications/my?${params.toString()}`);
  },

  /**
   * Get unread notifications
   */
  getUnreadNotifications: async () => {
    return request<ApiResponse<NotificationDTO[]>>('/api/notifications/my/unread');
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async () => {
    return request<ApiResponse<number>>('/api/notifications/my/unread/count');
  },

  /**
   * Get a specific notification by ID
   */
  getNotification: async (id: string) => {
    return request<ApiResponse<NotificationDTO>>(`/api/notifications/${id}`);
  },

  /**
   * Send a notification (Admin/System use)
   */
  sendNotification: async (requestBody: SendNotificationRequest) => {
    return request<ApiResponse<NotificationDTO>>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string) => {
    return request<ApiResponse<void>>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    return request<ApiResponse<void>>('/api/notifications/my/read-all', {
      method: 'PUT',
    });
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string) => {
    return request<ApiResponse<void>>(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  }
};

// Note: For Real-time notifications (WebSocket), use @stomp/stompjs
// Connect to: ws://localhost:8080/ws
// Subscribe to: /user/queue/notifications