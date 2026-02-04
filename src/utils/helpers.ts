// Simulate API delay
export const simulateApiDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-US', options || defaultOptions);
};

// Format date and time
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format relative time
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
};

// Calculate number of nights between two dates
export const calculateNights = (checkIn: string | Date, checkOut: string | Date): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Generate invoice number
export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${random}`;
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Pluralize word based on count
export const pluralize = (count: number, singular: string, plural?: string): string => {
  return count === 1 ? singular : (plural || `${singular}s`);
};

// Get room type label
export const getRoomTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    standard: 'Standard',
    deluxe: 'Deluxe',
    suite: 'Suite',
    presidential: 'Presidential',
  };
  return labels[type] || capitalize(type);
};

// Get room status label
export const getRoomStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    available: 'Available',
    occupied: 'Occupied',
    cleaning: 'Cleaning',
    maintenance: 'Maintenance',
  };
  return labels[status] || capitalize(status);
};

// Get booking status label
export const getBookingStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    reserved: 'Reserved',
    'checked-in': 'Checked In',
    'checked-out': 'Checked Out',
    cancelled: 'Cancelled',
  };
  return labels[status] || capitalize(status);
};

// Get payment status label
export const getPaymentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    partial: 'Partial',
    refunded: 'Refunded',
  };
  return labels[status] || capitalize(status);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
