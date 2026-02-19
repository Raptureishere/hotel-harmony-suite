import { User } from '@/types/auth';
import { Room } from '@/types/room';
import { Guest } from '@/types/guest';
import { Booking } from '@/types/booking';
import { Payment, Invoice } from '@/types/payment';
import { Staff, ActivityLog } from '@/types/staff';
import { Notification } from '@/types/notification';

// All data starts empty — add through the UI
export const mockUsers: User[] = [];
export const mockRooms: Room[] = [];
export const mockGuests: Guest[] = [];
export const mockBookings: Booking[] = [];
export const mockPayments: Payment[] = [];
export const mockInvoices: Invoice[] = [];
export const mockStaff: Staff[] = [];
export const mockActivityLogs: ActivityLog[] = [];
export const mockNotifications: Notification[] = [];
