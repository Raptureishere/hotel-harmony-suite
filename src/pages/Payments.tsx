import { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  Filter,
  Download,
  FileText,
  X,
  Printer,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useGetPaymentsQuery } from '@/features/payments/paymentsApi';
import { getGuestsData } from '@/features/guests/guestsApi';
import { getBookingsData } from '@/features/bookings/bookingsApi';
import { formatCurrency, formatDateTime, getPaymentStatusLabel } from '@/utils/helpers';
import KpiCard from '@/components/common/KpiCard';
import type { Payment } from '@/types/payment';

/* ─── CSV Export ─────────────────────────────────── */
const exportCSV = (payments: Payment[], getGuest: (id: string) => string) => {
  const header = ['Transaction ID', 'Guest', 'Amount', 'Method', 'Type', 'Status', 'Date'];
  const rows = payments.map(p => [
    p.transactionId || `TXN-${p.id}`,
    getGuest(p.guestId),
    p.amount.toFixed(2),
    p.method,
    p.type,
    p.status,
    new Date(p.createdAt).toLocaleString(),
  ]);
  const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ─── Invoice Modal ──────────────────────────────── */
const InvoiceModal = ({
  open,
  onClose,
  payments,
  getGuest,
}: {
  open: boolean;
  onClose: () => void;
  payments: Payment[];
  getGuest: (id: string) => string;
}) => {
  const [selectedId, setSelectedId] = useState('');
  const payment = payments.find(p => p.id === selectedId);
  const bookings = getBookingsData();
  const booking = payment ? bookings.find(b => b.id === payment.bookingId) : null;
  const guestName = payment ? getGuest(payment.guestId) : '';
  const invoiceNo = payment ? `INV-${payment.transactionId?.slice(-6) || payment.id.slice(-6).toUpperCase()}` : '';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    const printArea = document.getElementById('invoice-print-area');
    if (!printArea) return;
    const win = window.open('', '_blank', 'width=700,height=900');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceNo}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
            .logo { font-size: 22px; font-weight: 700; color: #1a237e; }
            .badge { background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; padding: 8px 12px; background: #f5f5f5; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .total-row td { font-weight: 700; font-size: 16px; border-bottom: none; padding-top: 16px; }
            .footer { margin-top: 48px; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>${printArea.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Create Invoice
          </DialogTitle>
        </DialogHeader>

        {/* Payment selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Payment *</label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a payment transaction..." />
            </SelectTrigger>
            <SelectContent>
              {payments.length === 0 && (
                <SelectItem value="__none" disabled>No payments available</SelectItem>
              )}
              {payments.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {getGuest(p.guestId)} — {formatCurrency(p.amount)} — {p.transactionId || `TXN-${p.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Invoice preview */}
        {payment && (
          <>
            <Separator />
            <div
              id="invoice-print-area"
              className="glass-card rounded-xl p-6 space-y-6 text-sm"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-5 w-5 text-accent" />
                    <span className="text-lg font-bold">Grand Hotel</span>
                  </div>
                  <p className="text-muted-foreground text-xs">123 Grand Avenue, Accra, Ghana</p>
                  <p className="text-muted-foreground text-xs">info@grandhotel.com · +233 30 222 0000</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-xl">{invoiceNo}</p>
                  <p className="text-muted-foreground text-xs">Date: {today}</p>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Billed To */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Billed To</p>
                <p className="font-semibold">{guestName}</p>
                {booking && (
                  <p className="text-muted-foreground text-xs">
                    Booking #{booking.id.slice(-6).toUpperCase()} · Room {booking.roomId}
                  </p>
                )}
              </div>

              {/* Line items */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 0', fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '6px 0', fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {booking && (
                    <tr>
                      <td style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="font-medium capitalize">Hotel Stay — {booking.roomId}</span>
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {booking.checkInDate} → {booking.checkOutDate}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  )}
                  {!booking && (
                    <tr>
                      <td style={{ padding: '10px 0' }} className="capitalize">{payment.type}</td>
                      <td style={{ textAlign: 'right', padding: '10px 0' }}>{formatCurrency(payment.amount)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Subtotal</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Tax (0%)</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-accent">{formatCurrency(payment.amount)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="rounded-lg bg-white/5 p-3 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment Details</p>
                <div className="flex justify-between text-xs">
                  <span>Method</span>
                  <span className="capitalize font-medium">{payment.method}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Transaction ID</span>
                  <span className="font-mono">{payment.transactionId || `TXN-${payment.id}`}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Processed</span>
                  <span>{formatDateTime(payment.processedAt || payment.createdAt)}</span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Thank you for staying at Grand Hotel. We look forward to welcoming you again.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="gold" className="flex-1" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print / Save as PDF
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ─── Main Component ─────────────────────────────── */
const Payments = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const { data: payments = [] } = useGetPaymentsQuery();
  const guests = getGuestsData();

  const getGuestName = (guestId: string) => {
    const g = guests.find(g => g.id === guestId);
    return g ? `${g.firstName} ${g.lastName}` : 'Unknown Guest';
  };

  const completedPayments = payments.filter(p => p.status === 'completed');
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const avgTransaction = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;

  const filtered = payments.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSearch = !search ||
      getGuestName(p.guestId).toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionId ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments &amp; Billing</h1>
          <p className="text-muted-foreground">Track payments and revenue from guest check-ins</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => exportCSV(filtered, getGuestName)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="gold" onClick={() => setInvoiceOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="All completed payments"
          icon={DollarSign}
          iconColor="text-status-available"
        />
        <KpiCard
          title="Pending Payments"
          value={formatCurrency(pendingAmount)}
          subtitle={`${payments.filter(p => p.status === 'pending').length} transactions`}
          icon={Clock}
          iconColor="text-status-cleaning"
        />
        <KpiCard
          title="Transactions"
          value={payments.length}
          subtitle="Total transactions"
          icon={CreditCard}
          iconColor="text-accent"
        />
        <KpiCard
          title="Avg. Transaction"
          value={formatCurrency(avgTransaction)}
          subtitle="Per completed payment"
          icon={TrendingUp}
          iconColor="text-status-maintenance"
        />
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Payment History</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest or transaction ID..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CreditCard className="h-10 w-10 mb-3 opacity-30" />
              <p className="font-medium">No payments yet</p>
              <p className="text-sm mt-1">Payments are recorded automatically when a guest is checked in</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.transactionId || `TXN-${payment.id}`}
                      </TableCell>
                      <TableCell>{getGuestName(payment.guestId)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {payment.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{payment.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'completed'
                              ? 'success'
                              : payment.status === 'pending'
                                ? 'warning'
                                : 'error'
                          }
                        >
                          {getPaymentStatusLabel(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(payment.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Modal */}
      <InvoiceModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        payments={payments}
        getGuest={getGuestName}
      />
    </div>
  );
};

export default Payments;
