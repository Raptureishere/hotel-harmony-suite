import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, BedDouble, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppStore';
import { setMobileMenuOpen } from '@/features/ui/uiSlice';
import { cn } from '@/lib/utils';
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

      {showDropdown && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 glass-card rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          {!hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for <span className="font-medium text-foreground">"{query}"</span>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
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
  const dispatch = useAppDispatch();
  const { mobileMenuOpen: sidebarMobileOpen } = useAppSelector((state) => state.ui);

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
    </header>
  );
};

export default Header;
