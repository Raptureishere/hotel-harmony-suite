import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useGetBookingByIdQuery,
    useUpdateBookingMutation,
} from '@/features/bookings/bookingsApi';
import { useGetRoomsQuery } from '@/features/rooms/roomsApi';
import { useGetGuestsQuery } from '@/features/guests/guestsApi';
import { BookingFormData } from '@/types/booking';
import { useToast } from '@/hooks/use-toast';
import { calculateNights, formatCurrency } from '@/utils/helpers';

const EditBooking = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data: booking, isLoading: bookingLoading } = useGetBookingByIdQuery(id!);
    const [updateBooking, { isLoading: isSaving }] = useUpdateBookingMutation();

    // Load all rooms (no status filter) so the current occupied/cleaning room still shows
    const { data: allRooms = [] } = useGetRoomsQuery(undefined);
    const { data: guests = [] } = useGetGuestsQuery();

    const [form, setForm] = useState<BookingFormData>({
        guestId: '',
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        numberOfGuests: 1,
        specialRequests: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
    const [initialised, setInitialised] = useState(false);

    // Pre-fill form once booking loads
    useEffect(() => {
        if (booking && !initialised) {
            setForm({
                guestId: booking.guestId,
                roomId: booking.roomId,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                numberOfGuests: booking.numberOfGuests,
                specialRequests: booking.specialRequests ?? '',
            });
            setInitialised(true);
        }
    }, [booking, initialised]);

    // Rooms available for selection: all available rooms + the currently booked room
    const availableRooms = allRooms.filter(
        r => r.status === 'available' || r.id === form.roomId
    );

    const selectedRoom = allRooms.find(r => r.id === form.roomId);
    const nights = form.checkInDate && form.checkOutDate
        ? calculateNights(form.checkInDate, form.checkOutDate)
        : 0;
    const totalAmount = selectedRoom ? selectedRoom.pricePerNight * nights : 0;

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof BookingFormData, string>> = {};
        if (!form.guestId) newErrors.guestId = 'Please select a guest';
        if (!form.roomId) newErrors.roomId = 'Please select a room';
        if (!form.checkInDate) newErrors.checkInDate = 'Check-in date is required';
        if (!form.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
        if (form.checkInDate && form.checkOutDate && form.checkInDate >= form.checkOutDate) {
            newErrors.checkOutDate = 'Check-out must be after check-in';
        }
        if (form.numberOfGuests < 1) newErrors.numberOfGuests = 'Must have at least 1 guest';
        if (selectedRoom && form.numberOfGuests > selectedRoom.maxOccupancy) {
            newErrors.numberOfGuests = `Max occupancy is ${selectedRoom.maxOccupancy} guests`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !booking) return;
        try {
            await updateBooking({ id: booking.id, data: form }).unwrap();
            toast({ title: 'Booking updated', description: 'Changes saved successfully.' });
            navigate(`/bookings/${booking.id}`);
        } catch {
            toast({ title: 'Error', description: 'Failed to save changes.', variant: 'destructive' });
        }
    };

    if (bookingLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">Booking not found.</p>
                <Button variant="outline" onClick={() => navigate('/bookings')}>Back to Bookings</Button>
            </div>
        );
    }

    // Only reserved bookings can be fully edited
    const isLocked = booking.status !== 'reserved';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/bookings/${booking.id}`)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Booking #{booking.id.slice(-6).toUpperCase()}
                    </h1>
                    <p className="text-muted-foreground">
                        {isLocked
                            ? `Only reserved bookings can be edited. This booking is ${booking.status}.`
                            : 'Update dates, room, guest count, or special requests.'}
                    </p>
                </div>
            </div>

            {isLocked ? (
                <Card>
                    <CardContent className="py-12 flex flex-col items-center gap-4">
                        <Calendar className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-muted-foreground text-center">
                            This booking has status <strong className="text-foreground capitalize">{booking.status}</strong> and can no longer be edited.<br />
                            Only <strong>Reserved</strong> bookings can be modified.
                        </p>
                        <Button variant="outline" onClick={() => navigate(`/bookings/${booking.id}`)}>
                            Back to Booking
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Dates */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-accent" />
                                        Stay Dates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="checkIn">Check-in Date</Label>
                                            <Input
                                                id="checkIn"
                                                type="date"
                                                value={form.checkInDate}
                                                onChange={e => setForm(f => ({ ...f, checkInDate: e.target.value }))}
                                            />
                                            {errors.checkInDate && <p className="text-xs text-destructive">{errors.checkInDate}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="checkOut">Check-out Date</Label>
                                            <Input
                                                id="checkOut"
                                                type="date"
                                                value={form.checkOutDate}
                                                onChange={e => setForm(f => ({ ...f, checkOutDate: e.target.value }))}
                                            />
                                            {errors.checkOutDate && <p className="text-xs text-destructive">{errors.checkOutDate}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Guest & Room */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-accent" />
                                        Guest & Room
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="guest">Guest</Label>
                                        <Select value={form.guestId} onValueChange={v => setForm(f => ({ ...f, guestId: v }))}>
                                            <SelectTrigger id="guest">
                                                <SelectValue placeholder="Select a guest" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {guests.map(g => (
                                                    <SelectItem key={g.id} value={g.id}>
                                                        {g.firstName} {g.lastName}
                                                        {g.vipStatus && ' ★'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.guestId && <p className="text-xs text-destructive">{errors.guestId}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="room">Room</Label>
                                        <Select value={form.roomId} onValueChange={v => setForm(f => ({ ...f, roomId: v }))}>
                                            <SelectTrigger id="room">
                                                <SelectValue placeholder="Select a room" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRooms.map(r => (
                                                    <SelectItem key={r.id} value={r.id}>
                                                        Room {r.roomNumber} — {r.type} · {formatCurrency(r.pricePerNight)}/night
                                                        {r.id === booking.roomId ? ' (current)' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.roomId && <p className="text-xs text-destructive">{errors.roomId}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="guests">Number of Guests</Label>
                                        <Input
                                            id="guests"
                                            type="number"
                                            min={1}
                                            max={selectedRoom?.maxOccupancy ?? 10}
                                            value={form.numberOfGuests}
                                            onChange={e => setForm(f => ({ ...f, numberOfGuests: Number(e.target.value) }))}
                                        />
                                        {errors.numberOfGuests && <p className="text-xs text-destructive">{errors.numberOfGuests}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="requests">Special Requests</Label>
                                        <Textarea
                                            id="requests"
                                            placeholder="Any special requests or notes..."
                                            value={form.specialRequests}
                                            onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary sidebar */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Price Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room</span>
                                        <span>{selectedRoom ? `Room ${selectedRoom.roomNumber}` : '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rate</span>
                                        <span>{selectedRoom ? `${formatCurrency(selectedRoom.pricePerNight)}/night` : '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Nights</span>
                                        <span>{nights > 0 ? nights : '—'}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>{totalAmount > 0 ? formatCurrency(totalAmount) : '—'}</span>
                                    </div>
                                    {totalAmount !== booking.totalAmount && totalAmount > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Previous total: {formatCurrency(booking.totalAmount)}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Button type="submit" variant="gold" className="w-full" disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="outline" className="w-full" onClick={() => navigate(`/bookings/${booking.id}`)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EditBooking;
