import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetBookingsQuery, useUpdateBookingStatusMutation, useCancelBookingMutation } from '@/features/bookings/bookingsApi';
import { formatDate, formatCurrency, getBookingStatusLabel, getPaymentStatusLabel, calculateNights } from '@/utils/helpers';
import { BookingStatus } from '@/types/booking';
import { useToast } from '@/hooks/use-toast';

const Bookings = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  
  const { data: bookings = [], isLoading } = useGetBookingsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
  });
  const [updateStatus] = useUpdateBookingStatusMutation();
  const [cancelBooking] = useCancelBookingMutation();
  const { toast } = useToast();

  const handleCheckIn = async (bookingId: string) => {
    try {
      await updateStatus({ id: bookingId, status: 'checked-in' }).unwrap();
      toast({
        title: 'Check-in successful',
        description: 'Guest has been checked in',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in guest',
        variant: 'destructive',
      });
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    try {
      await updateStatus({ id: bookingId, status: 'checked-out' }).unwrap();
      toast({
        title: 'Check-out successful',
        description: 'Guest has been checked out',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check out guest',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId).unwrap();
      toast({
        title: 'Booking cancelled',
        description: 'The booking has been cancelled',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive',
      });
    }
  };

  const statusCounts = {
    reserved: bookings.filter((b) => b.status === 'reserved').length,
    'checked-in': bookings.filter((b) => b.status === 'checked-in').length,
    'checked-out': bookings.filter((b) => b.status === 'checked-out').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">
            View and manage all hotel reservations
          </p>
        </div>
        <Button variant="gold" asChild>
          <Link to="/bookings/new">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Link>
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          variant="interactive"
          className={statusFilter === 'reserved' ? 'ring-2 ring-accent' : ''}
          onClick={() => setStatusFilter(statusFilter === 'reserved' ? 'all' : 'reserved')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-maintenance/10">
              <Calendar className="h-5 w-5 text-status-maintenance" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.reserved}</p>
              <p className="text-sm text-muted-foreground">Reserved</p>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          className={statusFilter === 'checked-in' ? 'ring-2 ring-accent' : ''}
          onClick={() => setStatusFilter(statusFilter === 'checked-in' ? 'all' : 'checked-in')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-available/10">
              <CheckCircle className="h-5 w-5 text-status-available" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts['checked-in']}</p>
              <p className="text-sm text-muted-foreground">Checked In</p>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          className={statusFilter === 'checked-out' ? 'ring-2 ring-accent' : ''}
          onClick={() => setStatusFilter(statusFilter === 'checked-out' ? 'all' : 'checked-out')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts['checked-out']}</p>
              <p className="text-sm text-muted-foreground">Checked Out</p>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          className={statusFilter === 'cancelled' ? 'ring-2 ring-accent' : ''}
          onClick={() => setStatusFilter(statusFilter === 'cancelled' ? 'all' : 'cancelled')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.cancelled}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name or room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as BookingStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {(statusFilter !== 'all' || search) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No bookings found</p>
              <p className="text-sm text-muted-foreground">
                Create a new booking to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Nights</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {booking.guest?.firstName} {booking.guest?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.guest?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          Room {booking.room?.roomNumber}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                      <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                      <TableCell>
                        {calculateNights(booking.checkInDate, booking.checkOutDate)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(booking.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={booking.status}>
                          {getBookingStatusLabel(booking.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={booking.paymentStatus}>
                          {getPaymentStatusLabel(booking.paymentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/bookings/${booking.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {booking.status === 'reserved' && (
                              <DropdownMenuItem onClick={() => handleCheckIn(booking.id)}>
                                <LogIn className="h-4 w-4 mr-2" />
                                Check In
                              </DropdownMenuItem>
                            )}
                            {booking.status === 'checked-in' && (
                              <DropdownMenuItem onClick={() => handleCheckOut(booking.id)}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Check Out
                              </DropdownMenuItem>
                            )}
                            {(booking.status === 'reserved' || booking.status === 'checked-in') && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleCancel(booking.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

export default Bookings;
