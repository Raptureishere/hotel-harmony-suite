import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, X, BedDouble, Users, ChevronRight } from 'lucide-react';
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
import { getRoomsData } from '@/features/rooms/roomsApi';
import { getGuestsData } from '@/features/guests/guestsApi';

/* ─── Global Search ──────────────────────────────── */
const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const q = query.trim().toLowerCase();

  const roomResults = q.length >= 1
    ? getRoomsData().filter(r =>
      r.roomNumber.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q)
    ).slice(0, 5)
    : [];

  const guestResults = q.length >= 1
    ? getGuestsData().filter(g =>
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      (g.country ?? '').toLowerCase().includes(q)
    ).slice(0, 5)
    : [];

  const hasResults = roomResults.length > 0 || guestResults.length > 0;
  const showDropdown = open && q.length >= 1;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const handleNavigate = (url: string) => {
    setOpen(false);
    setQuery('');
    navigate(url);
  };

  const statusColor: Record<string, string> = {
    available: 'text-green-400',
    occupied: 'text-red-400',
    cleaning: 'text-yellow-400',
    maintenance: 'text-orange-400',
  };

  const inputEl = (extraClass = '') => (
    <div ref={containerRef} className={cn('relative', extraClass)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search rooms or guests..."
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="pl-9 bg-muted/50 border-transparent focus:border-input focus:bg-background transition-colors w-full"
      />

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 glass-card rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          {!hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for <span className="font-medium text-foreground">"{query}"</span>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">

              {/* Rooms section */}
              {roomResults.length > 0 && (
                <div>
                  <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Rooms</span>
                    <button
                      className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
                      onMouseDown={() => handleNavigate('/rooms')}
                    >
                      View all <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  {roomResults.map(room => (
                    <button
                      key={room.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                      onMouseDown={() => handleNavigate(`/rooms/${room.id}`)}
                    >
                      <div className="p-1.5 rounded-lg bg-accent/10">
                        <BedDouble className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Room {room.roomNumber}</p>
                        <p className="text-xs text-muted-foreground capitalize">{room.type} · Floor {room.floor} · ${room.pricePerNight}/night</p>
                      </div>
                      <span className={cn('text-xs font-medium capitalize', statusColor[room.status])}>
                        {room.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Guests section */}
              {guestResults.length > 0 && (
                <div>
                  <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Guests</span>
                    <button
                      className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
                      onMouseDown={() => handleNavigate('/guests')}
                    >
                      View all <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  {guestResults.map(guest => (
                    <button
                      key={guest.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                      onMouseDown={() => handleNavigate(`/guests/${guest.id}`)}
                    >
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Users className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium">{guest.firstName} {guest.lastName}</p>
                          {guest.vipStatus && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">VIP</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{guest.email} · {guest.country}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{guest.totalBookings} stay{guest.totalBookings !== 1 ? 's' : ''}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        {inputEl()}
      </div>

      {/* Mobile search toggle */}
      <div className="md:hidden">
        {mobileOpen ? (
          <div className="fixed inset-x-0 top-0 z-50 h-16 glass-header flex items-center px-4 gap-2">
            {inputEl('flex-1')}
            <Button variant="ghost" size="icon" onClick={() => { setMobileOpen(false); setQuery(''); setOpen(false); }}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => { setMobileOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}>
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>
    </>
  );
};

/* ─── Header ─────────────────────────────────────── */
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpenState] = useState(false);
  const dispatch = useAppDispatch();
  const { mobileMenuOpen: sidebarMobileOpen } = useAppSelector((state) => state.ui);
  const { data: notifications = [] } = useGetNotificationsQuery();
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  void mobileMenuOpen;
  void setMobileMenuOpenState;

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
        onClick={() => dispatch(setMobileMenuOpen(!sidebarMobileOpen))}
      >
        {sidebarMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Global Search */}
      <GlobalSearch />

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
