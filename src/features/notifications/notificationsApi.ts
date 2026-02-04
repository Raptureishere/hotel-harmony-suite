import { api } from '@/app/api';
import type { Notification } from '@/types/notification';
import { mockNotifications } from '@/utils/mockData';
import { simulateApiDelay } from '@/utils/helpers';

let notifications = [...mockNotifications];

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      queryFn: async () => {
        await simulateApiDelay(200);
        return { data: notifications.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )};
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
