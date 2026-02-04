// Re-export all types
export * from './auth';
export * from './room';
export * from './booking';
export * from './guest';
export * from './payment';
export * from './staff';
export * from './dashboard';
export * from './notification';

// Common types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface SelectOption {
  value: string;
  label: string;
}
