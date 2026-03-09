import { api } from '@/app/api';
import type { Notification, NotificationCategory, NotificationType } from '@/types/notification';
import { simulateApiDelay } from '@/utils/helpers';

let notifications: Notification[] = [
  {
    id: 'notif-seed-1',
    type: 'info',
    category: 'system',
    title: 'Welcome to Grand Hotel',
    message: 'System is running. New events (check-ins, bookings, cancellations) will appear here automatically.',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-seed-2',
    type: 'success',
    category: 'booking',
    title: 'Booking Confirmed',
    message: 'Booking #GH12345 for John Doe has been successfully confirmed.',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 1000).toISOString(), // A minute ago
  },
];

/* ─── Public helper — call from any API module ──────────────────────────────
   Usage: pushNotification({ type, category, title, message, actionUrl })
   The RTK Query cache is invalidated automatically so the bell updates live. */
export const pushNotification = (payload: {
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actionUrl?: string;
}) => {
  const n: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  notifications.unshift(n);          // add to top of list

  // Invalidate the RTK Query cache so all subscribers re-render
  try {
    const { store } = require('@/app/store') as { store: import('@reduxjs/toolkit').EnhancedStore };
    store.dispatch(api.util.invalidateTags(['Notification']));
  } catch {
    // store not ready yet (e.g. during SSR/test) — safe to ignore
  }
};

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      queryFn: async () => {
        await simulateApiDelay(200);
        return { data: [...notifications] };
      },
      providesTags: ['Notification'],
    }),

    getUnreadCount: builder.query<number, void>({
      queryFn: async () => {
        await simulateApiDelay(100);
        return { data: notifications.filter(n => !n.isRead).length };
      },
      providesTags: ['Notification'],
    }),

    markAsRead: builder.mutation<void, string>({
      queryFn: async (id) => {
        await simulateApiDelay(200);
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          notifications[index] = { ...notifications[index], isRead: true };
        }
        return { data: undefined };
      },
      invalidatesTags: ['Notification'],
    }),

    markAllAsRead: builder.mutation<void, void>({
      queryFn: async () => {
        await simulateApiDelay(200);
        notifications = notifications.map(n => ({ ...n, isRead: true }));
        return { data: undefined };
      },
      invalidatesTags: ['Notification'],
    }),

    dismissNotification: builder.mutation<void, string>({
      queryFn: async (id) => {
        await simulateApiDelay(200);
        notifications = notifications.filter(n => n.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDismissNotificationMutation,
} = notificationsApi;
