// Booking types and statuses
export type BookingStatus = 'reserved' | 'checked-in' | 'checked-out' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial';

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  numberOfGuests: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  guest?: Guest;
  room?: Room;
}

export interface BookingFormData {
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  guestId?: string;
  roomId?: string;
  search?: string;
}

import { Room } from './room';
import { Guest } from './guest';
