import {
  BedDouble,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import KpiCard from '@/components/common/KpiCard';
import { useGetDashboardStatsQuery, useGetOccupancyTrendQuery, useGetRevenueTrendQuery } from '@/features/dashboard/dashboardApi';
import { useGetTodayCheckInsQuery, useGetTodayCheckOutsQuery } from '@/features/bookings/bookingsApi';
import { useAppSelector } from '@/hooks/useAppStore';
import { formatCurrency, formatDate } from '@/utils/helpers';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: occupancyData, isLoading: occupancyLoading } = useGetOccupancyTrendQuery({ days: 14 });
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueTrendQuery({ days: 7 });
  const { data: todayCheckIns = [] } = useGetTodayCheckInsQuery();
  const { data: todayCheckOuts = [] } = useGetTodayCheckOutsQuery();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening at your hotel today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/bookings">View All Bookings</Link>
          </Button>
          <Button variant="gold" asChild>
            <Link to="/bookings/new">New Booking</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-20" />
            </Card>
          ))
        ) : (
          <>
            <KpiCard
              title="Total Rooms"
              value={stats?.totalRooms || 0}
              subtitle={`${stats?.availableRooms || 0} available`}
              icon={BedDouble}
              iconColor="text-status-maintenance"
            />
            <KpiCard
              title="Occupancy Rate"
              value={`${stats?.occupancyRate || 0}%`}
              subtitle={`${stats?.occupiedRooms || 0} rooms occupied`}
              icon={TrendingUp}
              trend={{ value: 5, isPositive: true }}
              iconColor="text-status-available"
            />
            <KpiCard
              title="Today's Check-ins"
              value={stats?.todayCheckIns || 0}
              subtitle={`${stats?.todayCheckOuts || 0} check-outs`}
              icon={Calendar}
              iconColor="text-accent"
            />
            <KpiCard
              title="Monthly Revenue"
              value={formatCurrency(stats?.monthlyRevenue || 0)}
              subtitle={`${formatCurrency(stats?.dailyRevenue || 0)} today`}
              icon={DollarSign}
              trend={{ value: 12, isPositive: true }}
              iconColor="text-status-available"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Occupancy Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Trend</CardTitle>
            <CardDescription>Room occupancy over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {occupancyLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={occupancyData}>
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="text-sm font-medium">{formatDate(label)}</p>
                            <p className="text-sm text-muted-foreground">
                              Occupancy: <span className="font-medium text-foreground">{payload[0].value}%</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    fill="url(#occupancyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="text-sm font-medium">{formatDate(label)}</p>
                            <p className="text-sm text-muted-foreground">
                              Revenue: <span className="font-medium text-foreground">{formatCurrency(payload[0].value as number)}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Bookings: <span className="font-medium text-foreground">{payload[0].payload.bookings}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(222, 47%, 20%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Today's Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Room Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Room Status
              <Button variant="ghost" size="sm" asChild>
                <Link to="/rooms">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-status-available/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-status-available" />
                <span className="font-medium">Available</span>
              </div>
              <Badge variant="available">{stats?.availableRooms || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-status-occupied/10">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-status-occupied" />
                <span className="font-medium">Occupied</span>
              </div>
              <Badge variant="occupied">{stats?.occupiedRooms || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-status-cleaning/10">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-status-cleaning" />
                <span className="font-medium">Cleaning</span>
              </div>
              <Badge variant="cleaning">{stats?.roomsInCleaning || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-status-maintenance/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-status-maintenance" />
                <span className="font-medium">Maintenance</span>
              </div>
              <Badge variant="maintenance">{stats?.roomsInMaintenance || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Today's Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Today's Check-ins
              <Badge variant="info">{todayCheckIns.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayCheckIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <Calendar className="h-10 w-10 mb-2 opacity-50" />
                <p>No check-ins scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayCheckIns.slice(0, 4).map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/bookings/${booking.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Room {booking.room?.roomNumber}
                      </p>
                    </div>
                    <Badge variant="reserved">Reserved</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Check-outs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Today's Check-outs
              <Badge variant="warning">{todayCheckOuts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayCheckOuts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <Calendar className="h-10 w-10 mb-2 opacity-50" />
                <p>No check-outs scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayCheckOuts.slice(0, 4).map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/bookings/${booking.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Room {booking.room?.roomNumber}
                      </p>
                    </div>
                    <Badge variant="checked-in">Checked In</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
