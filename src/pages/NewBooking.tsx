import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
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
import { useCreateBookingMutation } from '@/features/bookings/bookingsApi';
import { useGetRoomsQuery } from '@/features/rooms/roomsApi';
import { useGetGuestsQuery } from '@/features/guests/guestsApi';
import { BookingFormData } from '@/types/booking';
import { useToast } from '@/hooks/use-toast';
import { calculateNights, formatCurrency } from '@/utils/helpers';

const NewBooking = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [createBooking, { isLoading }] = useCreateBookingMutation();
    const [searchParams] = useSearchParams();
    const prefilledGuestId = searchParams.get('guestId') || '';

    const { data: rooms = [] } = useGetRoomsQuery({ status: 'available' });
    const { data: guests = [] } = useGetGuestsQuery();

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [form, setForm] = useState<BookingFormData>({
        guestId: prefilledGuestId,
        roomId: '',
        checkInDate: today,
        checkOutDate: tomorrow,
        numberOfGuests: 1,
        specialRequests: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

    const selectedRoom = rooms.find((r) => r.id === form.roomId);
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
        if (!validate()) return;
        try {
            await createBooking(form).unwrap();
            toast({
                title: 'Booking created',
                description: 'The reservation has been made successfully.',
            });
            navigate('/bookings');
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to create booking. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/bookings')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">New Booking</h1>
                    <p className="text-muted-foreground">Create a new reservation</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
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
                                    <Label htmlFor="guest">Guest *</Label>
                                    <Select
                                        value={form.guestId}
                                        onValueChange={(v) => setForm((p) => ({ ...p, guestId: v }))}
                                    >
                                        <SelectTrigger id="guest" className={errors.guestId ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select a guest..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {guests.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>
                                                    {g.firstName} {g.lastName} — {g.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.guestId && <p className="text-xs text-destructive">{errors.guestId}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="room">Room *</Label>
                                    <Select
                                        value={form.roomId}
                                        onValueChange={(v) => setForm((p) => ({ ...p, roomId: v }))}
                                    >
                                        <SelectTrigger id="room" className={errors.roomId ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select an available room..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rooms.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    Room {r.roomNumber} — {r.type.charAt(0).toUpperCase() + r.type.slice(1)} — {formatCurrency(r.pricePerNight)}/night
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.roomId && <p className="text-xs text-destructive">{errors.roomId}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numberOfGuests">Number of Guests *</Label>
                                    <Input
                                        id="numberOfGuests"
                                        type="number"
                                        min={1}
                                        max={selectedRoom?.maxOccupancy || 20}
                                        value={form.numberOfGuests}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, numberOfGuests: parseInt(e.target.value) || 1 }))
                                        }
                                        className={errors.numberOfGuests ? 'border-destructive' : ''}
                                    />
                                    {errors.numberOfGuests && <p className="text-xs text-destructive">{errors.numberOfGuests}</p>}
                                    {selectedRoom && (
                                        <p className="text-xs text-muted-foreground">
                                            Max occupancy: {selectedRoom.maxOccupancy} guests
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-accent" />
                                    Dates
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="checkIn">Check-in Date *</Label>
                                        <Input
                                            id="checkIn"
                                            type="date"
                                            min={today}
                                            value={form.checkInDate}
                                            onChange={(e) => setForm((p) => ({ ...p, checkInDate: e.target.value }))}
                                            className={errors.checkInDate ? 'border-destructive' : ''}
                                        />
                                        {errors.checkInDate && <p className="text-xs text-destructive">{errors.checkInDate}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="checkOut">Check-out Date *</Label>
                                        <Input
                                            id="checkOut"
                                            type="date"
                                            min={form.checkInDate || today}
                                            value={form.checkOutDate}
                                            onChange={(e) => setForm((p) => ({ ...p, checkOutDate: e.target.value }))}
                                            className={errors.checkOutDate ? 'border-destructive' : ''}
                                        />
                                        {errors.checkOutDate && <p className="text-xs text-destructive">{errors.checkOutDate}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialRequests">Special Requests</Label>
                                    <Textarea
                                        id="specialRequests"
                                        placeholder="Any special requests or notes..."
                                        rows={3}
                                        value={form.specialRequests || ''}
                                        onChange={(e) => setForm((p) => ({ ...p, specialRequests: e.target.value }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Panel */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {selectedRoom && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Room</span>
                                            <span className="font-medium capitalize">Room {selectedRoom.roomNumber} ({selectedRoom.type})</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Price/Night</span>
                                            <span className="font-medium">{formatCurrency(selectedRoom.pricePerNight)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Check-in</span>
                                    <span className="font-medium">{form.checkInDate || '—'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Check-out</span>
                                    <span className="font-medium">{form.checkOutDate || '—'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Nights</span>
                                    <span className="font-medium">{nights}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-accent text-lg">{formatCurrency(totalAmount)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Booking'}
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/bookings')}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewBooking;
