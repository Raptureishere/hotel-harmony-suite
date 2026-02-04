// Staff types
import { UserRole } from './auth';

export interface Staff {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  hireDate: string;
  isActive: boolean;
  avatar?: string;
  address?: string;
  emergencyContact?: string;
  salary?: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  hireDate: string;
  address?: string;
  emergencyContact?: string;
  salary?: number;
  permissions: string[];
}

export interface ActivityLog {
  id: string;
  staffId: string;
  action: string;
  entityType: 'booking' | 'room' | 'guest' | 'payment' | 'staff';
  entityId: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
