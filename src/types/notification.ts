// Notification types
export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationCategory = 'booking' | 'payment' | 'room' | 'guest' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}
