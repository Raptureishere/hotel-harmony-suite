import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDismissNotificationMutation,
} from '@/features/notifications/notificationsApi';
import { formatRelativeTime } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/notification';

const getNotificationTypeColor = (type: Notification['type']) => {
    const map: Record<string, string> = {
        info: 'bg-status-maintenance',
        warning: 'bg-status-cleaning',
        error: 'bg-status-occupied',
        success: 'bg-status-available',
    };
    return map[type] || map.info;
};

const getNotificationTypeBadge = (type: Notification['type']) => {
    const map: Record<string, 'info' | 'warning' | 'error' | 'success'> = {
        info: 'info',
        warning: 'warning',
        error: 'error',
        success: 'success',
    };
    return map[type] || 'info';
};

const NotificationsPage = () => {
    const { data: notifications = [], isLoading } = useGetNotificationsQuery();
    const { data: unreadCount = 0 } = useGetUnreadCountQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [dismissNotification] = useDismissNotificationMutation();

    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const readNotifications = notifications.filter((n) => n.isRead);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={() => markAllAsRead()}>
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="p-4 rounded-full bg-muted">
                            <Bell className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium">No notifications</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                You're all caught up. New alerts will appear here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Unread */}
                    {unreadNotifications.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    Unread
                                </h2>
                                <Badge variant="destructive" className="text-xs h-5 px-1.5">
                                    {unreadNotifications.length}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {unreadNotifications.map((notification) => (
                                    <NotificationRow
                                        key={notification.id}
                                        notification={notification}
                                        onMarkRead={() => markAsRead(notification.id)}
                                        onDismiss={() => dismissNotification(notification.id)}
                                        getTypeColor={getNotificationTypeColor}
                                        getTypeBadge={getNotificationTypeBadge}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Read */}
                    {readNotifications.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Earlier
                            </h2>
                            <div className="space-y-2">
                                {readNotifications.map((notification) => (
                                    <NotificationRow
                                        key={notification.id}
                                        notification={notification}
                                        onMarkRead={() => markAsRead(notification.id)}
                                        onDismiss={() => dismissNotification(notification.id)}
                                        getTypeColor={getNotificationTypeColor}
                                        getTypeBadge={getNotificationTypeBadge}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface NotificationRowProps {
    notification: Notification;
    onMarkRead: () => void;
    onDismiss: () => void;
    getTypeColor: (type: Notification['type']) => string;
    getTypeBadge: (type: Notification['type']) => 'info' | 'warning' | 'error' | 'success';
}

const NotificationRow = ({
    notification,
    onMarkRead,
    onDismiss,
    getTypeColor,
    getTypeBadge,
}: NotificationRowProps) => {
    return (
        <Card
            className={cn(
                'transition-all duration-200 hover:shadow-md',
                !notification.isRead && 'border-accent/30 bg-accent/5'
            )}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    {/* Type indicator */}
                    <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0', getTypeColor(notification.type))} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className={cn('text-sm font-medium', !notification.isRead && 'text-foreground')}>
                                    {notification.title}
                                </p>
                                <Badge variant={getTypeBadge(notification.type)} className="text-xs">
                                    {notification.type}
                                </Badge>
                                {!notification.isRead && (
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatRelativeTime(notification.createdAt)}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onMarkRead}
                                title="Mark as read"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onDismiss}
                            title="Dismiss"
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default NotificationsPage;
