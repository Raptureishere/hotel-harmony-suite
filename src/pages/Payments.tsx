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
import { useGetPaymentsQuery } from '@/features/payments/paymentsApi';
import { getGuestsData } from '@/features/guests/guestsApi';
import { formatCurrency, formatDateTime, getPaymentStatusLabel } from '@/utils/helpers';
import KpiCard from '@/components/common/KpiCard';

const Payments = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

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
    </div>
  );
};

export default Payments;
