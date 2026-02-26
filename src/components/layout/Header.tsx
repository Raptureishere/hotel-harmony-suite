import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppStore';
import { setMobileMenuOpen } from '@/features/ui/uiSlice';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/features/notifications/notificationsApi';
import { formatRelativeTime } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/notification';

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { mobileMenuOpen } = useAppSelector((state) => state.ui);
  const { data: notifications = [] } = useGetNotificationsQuery();
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const getNotificationIcon = (type: Notification['type']) => {
    const colors = {
      info: 'bg-status-maintenance',
      warning: 'bg-status-cleaning',
      error: 'bg-status-occupied',
      success: 'bg-status-available',
    };
    return colors[type] || colors.info;
  };

  return (
    <header className="h-16 glass-header flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bookings, guests, rooms..."
            className={cn(
              'pl-9 bg-muted/50 border-transparent focus:border-input focus:bg-background transition-colors',
              searchOpen ? 'w-full' : 'hidden md:block'
            )}
          />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => markAllAsRead()}
              >
                Mark all read
              </Button>
            )}
          </div>
          <ScrollArea className="h-80">
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No notifications
              </div>
            ) : (
              <div className="divide-y">
                {notifications.slice(0, 10).map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.actionUrl || '#'}
                    className={cn(
                      'flex gap-3 p-4 hover:bg-muted/50 transition-colors',
                      !notification.isRead && 'bg-muted/30'
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                        getNotificationIcon(notification.type)
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="p-2 border-t">
            <Button variant="ghost" className="w-full text-sm" asChild>
              <Link to="/notifications">View all notifications</Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </header>
  );
};

export default Header;
