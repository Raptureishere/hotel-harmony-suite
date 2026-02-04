// Payment types
export type PaymentMethod = 'cash' | 'card' | 'online' | 'bank_transfer';
export type PaymentType = 'booking' | 'service' | 'refund' | 'deposit';

export interface Payment {
  id: string;
  bookingId: string;
  guestId: string;
  amount: number;
  method: PaymentMethod;
  type: PaymentType;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  notes?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  guestId: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentFormData {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}
