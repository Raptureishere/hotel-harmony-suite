import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    User,
    BedDouble,
    DollarSign,
    MessageSquare,
    ClipboardList,
    LogIn,
    LogOut,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    useGetBookingByIdQuery,
    useUpdateBookingStatusMutation,
    useCancelBookingMutation,
} from '@/features/bookings/bookingsApi';
import { formatCurrency, formatDate, formatDateTime, getBookingStatusLabel } from '@/utils/helpers';
import { BookingStatus } from '@/types/booking';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector } from '@/hooks/useAppStore';

const BookingDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data: booking, isLoading, isError } = useGetBookingByIdQuery(id!);
    const [updateStatus] = useUpdateBookingStatusMutation();
    const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
    const { user } = useAppSelector(state => state.auth);
    const performedBy = { performedByUserId: user?.id, performedByName: user?.name };

    const handleCheckIn = async () => {
        if (!booking) return;
        try {
            await updateStatus({ id: booking.id, status: 'checked-in', ...performedBy }).unwrap();
            toast({ title: 'Checked in', description: `Guest ${booking.guest?.firstName} has been checked in.` });
        } catch {
            toast({ title: 'Error', description: 'Check-in failed.', variant: 'destructive' });
        }
    };

    const handleCheckOut = async () => {
        if (!booking) return;
        try {
            await updateStatus({ id: booking.id, status: 'checked-out', ...performedBy }).unwrap();
            toast({ title: 'Checked out', description: `Guest checked out of Room ${booking.room?.roomNumber}.` });
        } catch {
            toast({ title: 'Error', description: 'Check-out failed.', variant: 'destructive' });
        }
    };

    const handleCancel = async () => {
        if (!booking) return;
        try {
            await cancelBooking({ id: booking.id, ...performedBy }).unwrap();
            toast({ title: 'Booking cancelled', description: 'The reservation has been cancelled.' });
        } catch {
            toast({ title: 'Error', description: 'Cancellation failed.', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading booking...</div>
            </div>
        );
    }

    if (isError || !booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Calendar className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Booking not found.</p>
                <Button variant="outline" onClick={() => navigate('/bookings')}>Back to Bookings</Button>
            </div>
        );
    }

    const statusVariantMap: Record<BookingStatus, 'reserved' | 'checked-in' | 'checked-out' | 'cancelled'> = {
        reserved: 'reserved',
        'checked-in': 'checked-in',
        'checked-out': 'checked-out',
        cancelled: 'cancelled',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/bookings')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight">Booking #{booking.id.slice(-6).toUpperCase()}</h1>
                            <Badge variant={statusVariantMap[booking.status]}>{getBookingStatusLabel(booking.status)}</Badge>
                            <Badge variant={booking.paymentStatus === 'paid' ? 'success' : booking.paymentStatus === 'partial' ? 'warning' : 'pending'}>
                                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">Created {formatDate(booking.createdAt)}</p>
                    </div>
                </div>
                {/* Action buttons based on status */}
                <div className="flex gap-2 flex-wrap">
                    {booking.status === 'reserved' && (
                        <>
                            <Button variant="success" onClick={handleCheckIn}>Check In</Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                                        Cancel
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will cancel booking #{booking.id.slice(-6).toUpperCase()}. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleCancel}
                                            disabled={isCancelling}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                    {booking.status === 'checked-in' && (
                        <Button variant="warning" onClick={handleCheckOut}>Check Out</Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Dates Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-accent" />
                                Stay Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Check-in</p>
                                    <p className="font-semibold">{formatDate(booking.checkInDate)}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-center gap-2 w-full">
                                        <div className="flex-1 h-px bg-border" />
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000)} nights
                                        </span>
                                        <div className="flex-1 h-px bg-border" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Check-out</p>
                                    <p className="font-semibold">{formatDate(booking.checkOutDate)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Guest Info */}
                    {booking.guest && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-accent" />
                                    Guest
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="font-semibold text-lg">
                                    {booking.guest.firstName} {booking.guest.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
                                <p className="text-sm text-muted-foreground">{booking.guest.phone}</p>
                                {booking.guest.vipStatus && <Badge variant="vip">VIP Guest</Badge>}
                            </CardContent>
                        </Card>
                    )}

                    {/* Room Info */}
                    {booking.room && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BedDouble className="h-5 w-5 text-accent" />
                                    Room
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="font-semibold text-lg">Room {booking.room.roomNumber}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {booking.room.type} — Floor {booking.room.floor}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Max {booking.room.maxOccupancy} guests · {formatCurrency(booking.room.pricePerNight)}/night
                                </p>
                                {booking.room.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                        {booking.room.amenities.slice(0, 5).map((a) => (
                                            <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                                        ))}
                                        {booking.room.amenities.length > 5 && (
                                            <Badge variant="secondary" className="text-xs">+{booking.room.amenities.length - 5} more</Badge>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Special Requests */}
                    {booking.specialRequests && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-accent" />
                                    Special Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic">"{booking.specialRequests}"</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Payment Panel */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-accent" />
                                Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span className="font-semibold">{formatCurrency(booking.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Paid</span>
                                <span className="font-semibold text-status-available">{formatCurrency(booking.paidAmount)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Balance Due</span>
                                <span className={`font-bold ${booking.totalAmount - booking.paidAmount > 0 ? 'text-destructive' : 'text-status-available'}`}>
                                    {formatCurrency(booking.totalAmount - booking.paidAmount)}
                                </span>
                            </div>
                            <Badge
                                variant={booking.paymentStatus === 'paid' ? 'success' : booking.paymentStatus === 'partial' ? 'warning' : 'pending'}
                                className="w-full justify-center"
                            >
                                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                            </Badge>
                        </CardContent>
                    </Card>

                    <div className="text-xs text-muted-foreground space-y-1 px-1">
                        <div className="flex justify-between">
                            <span>Guests</span>
                            <span>{booking.numberOfGuests}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Last updated</span>
                            <span>{formatDate(booking.updatedAt)}</span>
                        </div>
                    </div>

                    {/* Audit Trail */}
                    {(booking.checkedInByName || booking.checkedOutByName || booking.cancelledByName) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <ClipboardList className="h-4 w-4 text-accent" />
                                    Audit Trail
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {booking.checkedInByName && (
                                    <div className="flex items-start gap-2 text-xs">
                                        <LogIn className="h-3.5 w-3.5 text-status-available mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-foreground">Checked in by</p>
                                            <p className="text-muted-foreground">{booking.checkedInByName}</p>
                                            {booking.checkedInAt && (
                                                <p className="text-muted-foreground">{formatDateTime(booking.checkedInAt)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {booking.checkedOutByName && (
                                    <div className="flex items-start gap-2 text-xs">
                                        <LogOut className="h-3.5 w-3.5 text-status-cleaning mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-foreground">Checked out by</p>
                                            <p className="text-muted-foreground">{booking.checkedOutByName}</p>
                                            {booking.checkedOutAt && (
                                                <p className="text-muted-foreground">{formatDateTime(booking.checkedOutAt)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {booking.cancelledByName && (
                                    <div className="flex items-start gap-2 text-xs">
                                        <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-foreground">Cancelled by</p>
                                            <p className="text-muted-foreground">{booking.cancelledByName}</p>
                                            {booking.cancelledAt && (
                                                <p className="text-muted-foreground">{formatDateTime(booking.cancelledAt)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;
