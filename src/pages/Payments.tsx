import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  Filter,
  Download,
  FileText,
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
import { mockPayments, mockInvoices, mockGuests, mockBookings } from '@/utils/mockData';
import { formatCurrency, formatDateTime, getPaymentStatusLabel } from '@/utils/helpers';
import KpiCard from '@/components/common/KpiCard';

const Payments = () => {
  const totalRevenue = mockPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayments = mockBookings
    .filter((b) => b.paymentStatus === 'pending' || b.paymentStatus === 'partial')
    .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  const paymentsWithDetails = mockPayments.map((payment) => ({
    ...payment,
    guest: mockGuests.find((g) => g.id === payment.guestId),
    booking: mockBookings.find((b) => b.id === payment.bookingId),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Billing</h1>
          <p className="text-muted-foreground">
            Manage payments, invoices, and transactions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="gold">
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
          value={formatCurrency(pendingPayments)}
          subtitle={`${mockBookings.filter((b) => b.paymentStatus !== 'paid').length} bookings`}
          icon={Clock}
          iconColor="text-status-cleaning"
        />
        <KpiCard
          title="Transactions"
          value={mockPayments.length}
          subtitle="Total transactions"
          icon={CreditCard}
          iconColor="text-accent"
        />
        <KpiCard
          title="Avg. Transaction"
          value={formatCurrency(totalRevenue / mockPayments.filter((p) => p.status === 'completed').length || 0)}
          subtitle="Per completed payment"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          iconColor="text-status-maintenance"
        />
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Recent Payments</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
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
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                {paymentsWithDetails.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {payment.transactionId || `TXN-${payment.id}`}
                    </TableCell>
                    <TableCell>
                      {payment.guest
                        ? `${payment.guest.firstName} ${payment.guest.lastName}`
                        : 'Unknown Guest'}
                    </TableCell>
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
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => {
                  const guest = mockGuests.find((g) => g.id === invoice.guestId);
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {guest
                          ? `${guest.firstName} ${guest.lastName}`
                          : 'Unknown Guest'}
                      </TableCell>
                      <TableCell>{invoice.items.length} items</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === 'paid'
                              ? 'success'
                              : invoice.status === 'sent'
                              ? 'info'
                              : invoice.status === 'overdue'
                              ? 'error'
                              : 'secondary'
                          }
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.dueDate}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
