import { api } from '@/app/api';
import type { DashboardStats, OccupancyData, RevenueData } from '@/types/dashboard';
import { mockRooms, mockBookings, mockPayments } from '@/utils/mockData';
import { simulateApiDelay } from '@/utils/helpers';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      queryFn: async () => {
        await simulateApiDelay(400);
        
        const today = new Date().toISOString().split('T')[0];
        
        const totalRooms = mockRooms.length;
        const occupiedRooms = mockRooms.filter(r => r.status === 'occupied').length;
        const availableRooms = mockRooms.filter(r => r.status === 'available').length;
        const roomsInCleaning = mockRooms.filter(r => r.status === 'cleaning').length;
        const roomsInMaintenance = mockRooms.filter(r => r.status === 'maintenance').length;
        
        const todayCheckIns = mockBookings.filter(
          b => b.checkInDate === today && b.status === 'reserved'
        ).length;
        
        const todayCheckOuts = mockBookings.filter(
          b => b.checkOutDate === today && b.status === 'checked-in'
        ).length;
        
        const pendingPayments = mockBookings.filter(
          b => b.paymentStatus === 'pending' || b.paymentStatus === 'partial'
        ).length;
        
        // Calculate revenue
        const completedPayments = mockPayments.filter(p => p.status === 'completed');
        const dailyRevenue = completedPayments
          .filter(p => p.createdAt.startsWith(today))
          .reduce((sum, p) => sum + p.amount, 0);
        
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().split('T')[0];
        
        const monthlyRevenue = completedPayments
          .filter(p => p.createdAt >= monthStartStr)
          .reduce((sum, p) => sum + p.amount, 0);
        
        const occupancyRate = totalRooms > 0 
          ? Math.round((occupiedRooms / totalRooms) * 100) 
          : 0;
        
        const averageDailyRate = occupiedRooms > 0
          ? mockRooms
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
        
        const data: OccupancyData[] = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          // Simulate varying occupancy
          const baseOccupancy = 60;
          const variation = Math.sin(i * 0.5) * 15 + Math.random() * 10;
          const occupancy = Math.min(100, Math.max(30, Math.round(baseOccupancy + variation)));
          
          const revenue = Math.round(occupancy * 25 * (1 + Math.random() * 0.2));
          
          data.push({
            date: dateStr,
            occupancy,
            revenue,
          });
        }
        
        return { data };
      },
      providesTags: ['Dashboard'],
    }),
    
    getRevenueTrend: builder.query<RevenueData[], { days: number }>({
      queryFn: async ({ days }) => {
        await simulateApiDelay(300);
        
        const data: RevenueData[] = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          // Simulate revenue with weekend peaks
          const dayOfWeek = date.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const baseRevenue = isWeekend ? 3500 : 2500;
          const variation = Math.random() * 800 - 400;
          
          data.push({
            date: dateStr,
            revenue: Math.round(baseRevenue + variation),
            bookings: Math.floor(Math.random() * 5) + 2,
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
