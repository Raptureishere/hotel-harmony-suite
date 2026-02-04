import { Link, useLocation } from 'react-router-dom';
import {
  Hotel,
  LayoutDashboard,
  BedDouble,
  Calendar,
  Users,
  CreditCard,
  UserCog,
  Settings,
  LogOut,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppStore';
import { logout } from '@/features/auth/authSlice';
import { setMobileMenuOpen, toggleDarkMode } from '@/features/ui/uiSlice';
import { getInitials } from '@/utils/helpers';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Rooms', href: '/rooms', icon: BedDouble },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Guests', href: '/guests', icon: Users },
  { name: 'Payments', href: '/payments', icon: CreditCard },
];

const adminNavigation = [
  { name: 'Staff', href: '/staff', icon: UserCog, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'manager'] },
];

const MobileSidebar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { mobileMenuOpen, darkMode } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(setMobileMenuOpen(false));
  };

  const handleNavClick = () => {
    dispatch(setMobileMenuOpen(false));
  };

  const isActive = (href: string) => location.pathname === href;

  const filteredAdminNav = adminNavigation.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  if (!mobileMenuOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => dispatch(setMobileMenuOpen(false))}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border z-50 lg:hidden flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={handleNavClick}>
            <div className="p-1.5 rounded-lg bg-sidebar-primary">
              <Hotel className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">Grand Hotel</span>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => dispatch(setMobileMenuOpen(false))}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <Icon className={cn('h-5 w-5', active && 'text-sidebar-primary')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {filteredAdminNav.length > 0 && (
            <>
              <Separator className="my-4 bg-sidebar-border" />
              <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
                Admin
              </p>
              <div className="space-y-1">
                {filteredAdminNav.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', active && 'text-sidebar-primary')} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(toggleDarkMode())}
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>

          {/* User profile */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {user?.role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
