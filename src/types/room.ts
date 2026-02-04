// Room types and statuses
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  floor: number;
  pricePerNight: number;
  status: RoomStatus;
  maxOccupancy: number;
  amenities: string[];
  description?: string;
  images?: string[];
  lastCleaned?: string;
  currentBookingId?: string;
}

export interface RoomFormData {
  roomNumber: string;
  type: RoomType;
  floor: number;
  pricePerNight: number;
  status: RoomStatus;
  maxOccupancy: number;
  amenities: string[];
  description?: string;
}

export interface RoomFilters {
  status?: RoomStatus;
  type?: RoomType;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
