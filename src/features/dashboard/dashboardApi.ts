import { api } from '@/app/api';
import type { DashboardStats, OccupancyData, RevenueData } from '@/types/dashboard';
import { getRoomsData } from '@/features/rooms/roomsApi';
import { getBookingsData, getPaymentsData } from '@/features/bookings/bookingsApi';
import { simulateApiDelay } from '@/utils/helpers';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      queryFn: async () => {
        await simulateApiDelay(400);

        const rooms = getRoomsData();
        const bookings = getBookingsData();
        const today = new Date().toISOString().split('T')[0];

        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
        const availableRooms = rooms.filter(r => r.status === 'available').length;
        const roomsInCleaning = rooms.filter(r => r.status === 'cleaning').length;
        const roomsInMaintenance = rooms.filter(r => r.status === 'maintenance').length;

        const todayCheckIns = bookings.filter(
          b => b.checkInDate === today && b.status === 'reserved'
        ).length;

        const todayCheckOuts = bookings.filter(
          b => b.checkOutDate === today && b.status === 'checked-in'
        ).length;

        const pendingPayments = bookings.filter(
          b => b.paymentStatus === 'pending' || b.paymentStatus === 'partial'
        ).length;

        // Revenue from real payment records (created on check-in)
        const livePayments = getPaymentsData().filter(p => p.status === 'completed');

        const dailyRevenue = livePayments
          .filter(p => p.createdAt.startsWith(today))
          .reduce((sum, p) => sum + p.amount, 0);

        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        const monthlyRevenue = livePayments
          .filter(p => p.createdAt >= monthStartStr)
          .reduce((sum, p) => sum + p.amount, 0);

        const occupancyRate = totalRooms > 0
          ? Math.round((occupiedRooms / totalRooms) * 100)
          : 0;

        const averageDailyRate = occupiedRooms > 0
          ? rooms
            .filter(r => r.status === 'occupied')
            .reduce((sum, r) => sum + r.pricePerNight, 0) / occupiedRooms
          : 0;

        return {
          data: {
            totalRooms,
            occupiedRooms,
            availableRooms,
            roomsInCleaning,
            roomsInMaintenance,
            todayCheckIns,
            todayCheckOuts,
            pendingPayments,
            dailyRevenue,
            monthlyRevenue,
            occupancyRate,
            averageDailyRate: Math.round(averageDailyRate),
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    getOccupancyTrend: builder.query<OccupancyData[], { days: number }>({
      queryFn: async ({ days }) => {
        await simulateApiDelay(300);

        const rooms = getRoomsData();
        const bookings = getBookingsData();
        const data: OccupancyData[] = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          // Count rooms occupied on that date from real bookings
          const occupiedOnDate = bookings.filter(b =>
            b.checkInDate <= dateStr &&
            b.checkOutDate > dateStr &&
            b.status !== 'cancelled'
          ).length;

          const total = rooms.length || 1;
          const occupancy = Math.min(100, Math.round((occupiedOnDate / total) * 100));

          const revenue = bookings
            .filter(b => b.checkInDate === dateStr)
            .reduce((sum, b) => sum + b.totalAmount, 0);

          data.push({ date: dateStr, occupancy, revenue });
        }

        return { data };
      },
      providesTags: ['Dashboard'],
    }),

    getRevenueTrend: builder.query<RevenueData[], { days: number }>({
      queryFn: async ({ days }) => {
        await simulateApiDelay(300);

        const bookings = getBookingsData();
        const data: RevenueData[] = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const dayBookings = bookings.filter(b => b.checkInDate === dateStr && b.status !== 'cancelled');
          const revenue = dayBookings.reduce((sum, b) => sum + b.totalAmount, 0);

          data.push({
            date: dateStr,
            revenue,
            bookings: dayBookings.length,
          });
        }

        return { data };
      },
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetOccupancyTrendQuery,
  useGetRevenueTrendQuery,
} = dashboardApi;
