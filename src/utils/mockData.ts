import { User } from '@/types/auth';
import { Room } from '@/types/room';
import { Guest } from '@/types/guest';
import { Booking } from '@/types/booking';
import { Payment, Invoice } from '@/types/payment';
import { Staff, ActivityLog } from '@/types/staff';
import { Notification } from '@/types/notification';

// Login accounts — required for authentication (password for all: "password")
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@hotel.com',
    name: 'Admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '2',
    email: 'manager@hotel.com',
    name: 'Manager',
    role: 'manager',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '3',
    email: 'reception@hotel.com',
    name: 'Receptionist',
    role: 'receptionist',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
];

// All operational data starts empty — add through the UI
export const mockRooms: Room[] = [];
export const mockGuests: Guest[] = [];
export const mockBookings: Booking[] = [];
export const mockPayments: Payment[] = [];
export const mockInvoices: Invoice[] = [];
export const mockStaff: Staff[] = [];
export const mockActivityLogs: ActivityLog[] = [];
export const mockNotifications: Notification[] = [];
