// Guest types
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  idType?: 'passport' | 'national_id' | 'drivers_license';
  idNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  notes?: string;
  vipStatus?: boolean;
  createdAt: string;
  updatedAt: string;
  totalBookings: number;
  totalSpent: number;
}

export interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  idType?: 'passport' | 'national_id' | 'drivers_license';
  idNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  notes?: string;
  vipStatus?: boolean;
}

export interface GuestFilters {
  search?: string;
  vipStatus?: boolean;
  country?: string;
}
