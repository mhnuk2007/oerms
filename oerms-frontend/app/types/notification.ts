export type NotificationType = 'EXAM_PUBLISHED' | 'RESULT_AVAILABLE' | 'SYSTEM_ALERT' | 'EXAM_REMINDER';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP';

export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  channels: NotificationChannel[];
  metadata?: {
    examId?: string;
    resultId?: string;
    url?: string;
  };
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  examPublished: NotificationChannel[];
  resultAvailable: NotificationChannel[];
  systemAlert: NotificationChannel[];
  examReminder: NotificationChannel[];
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}