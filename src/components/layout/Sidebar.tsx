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
  ChevronLeft,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppStore';
import { logout } from '@/features/auth/authSlice';
import { toggleSidebar, toggleDarkMode } from '@/features/ui/uiSlice';
import { getInitials } from '@/utils/helpers';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarCollapsed, darkMode } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
  };

  const isActive = (href: string) => location.pathname === href;

  const filteredAdminNav = adminNavigation.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    const content = (
      <Link
        to={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-sidebar-primary')} />
        {!sidebarCollapsed && <span>{item.name}</span>}
      </Link>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-sidebar-primary">
            <Hotel className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-sidebar-foreground">Grand Hotel</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => dispatch(toggleSidebar())}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              sidebarCollapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        {filteredAdminNav.length > 0 && (
          <>
            <Separator className="my-4 bg-sidebar-border" />
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
                  Admin
                </p>
              )}
              {filteredAdminNav.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size={sidebarCollapsed ? 'icon-sm' : 'sm'}
          onClick={() => dispatch(toggleDarkMode())}
          className={cn(
            'text-sidebar-foreground hover:bg-sidebar-accent',
            !sidebarCollapsed && 'w-full justify-start gap-3'
          )}
        >
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {!sidebarCollapsed && (darkMode ? 'Light Mode' : 'Dark Mode')}
        </Button>

        {/* User profile */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2',
            !sidebarCollapsed && 'bg-sidebar-accent/50'
          )}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {user?.role}
              </p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleLogout}
                className="text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={sidebarCollapsed ? 'right' : 'top'}>
              Sign out
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
