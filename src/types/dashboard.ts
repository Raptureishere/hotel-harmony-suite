// Dashboard types
export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  roomsInCleaning: number;
  roomsInMaintenance: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  pendingPayments: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  occupancyRate: number;
  averageDailyRate: number;
}

export interface OccupancyData {
  date: string;
  occupancy: number;
  revenue: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface RoomTypeDistribution {
  type: string;
  count: number;
  revenue: number;
}
