import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Star,
    Calendar,
    DollarSign,
    Edit,
    Trash2,
    CreditCard,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGetGuestByIdQuery, useDeleteGuestMutation } from '@/features/guests/guestsApi';
import { formatCurrency, formatDate, getInitials, pluralize } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';

const GuestDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data: guest, isLoading, isError } = useGetGuestByIdQuery(id!);
    const [deleteGuest, { isLoading: isDeleting }] = useDeleteGuestMutation();

    const handleDelete = async () => {
        if (!guest) return;
        try {
            await deleteGuest(guest.id).unwrap();
            toast({ title: 'Guest removed', description: `${guest.firstName} ${guest.lastName} has been deleted.` });
            navigate('/guests');
        } catch {
            toast({ title: 'Error', description: 'Failed to delete guest.', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading guest profile...</div>
            </div>
        );
    }

    if (isError || !guest) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <User className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Guest not found.</p>
                <Button variant="outline" onClick={() => navigate('/guests')}>Back to Guests</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/guests')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                {getInitials(`${guest.firstName} ${guest.lastName}`)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {guest.firstName} {guest.lastName}
                                </h1>
                                {guest.vipStatus && <Badge variant="vip">VIP</Badge>}
                            </div>
                            <p className="text-muted-foreground">{guest.email}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/guests/${guest.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Guest?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete {guest.firstName} {guest.lastName}'s profile. Booking history will be preserved but unlinked.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <a href={`mailto:${guest.email}`} className="text-accent hover:underline">{guest.email}</a>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{guest.phone}</span>
                            </div>
                            {(guest.address || guest.city || guest.country) && (
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <span>
                                        {[guest.address, guest.city, guest.country].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}
                            {guest.nationality && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-muted-foreground">Nationality:</span>
                                    <span>{guest.nationality}</span>
                                </div>
                            )}
                            {guest.dateOfBirth && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-muted-foreground">Date of Birth:</span>
                                    <span>{formatDate(guest.dateOfBirth)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ID Info */}
                    {(guest.idType || guest.idNumber) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-accent" />
                                    Identification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {guest.idType && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">ID Type</span>
                                        <span className="capitalize">{guest.idType.replace('_', ' ')}</span>
                                    </div>
                                )}
                                {guest.idNumber && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">ID Number</span>
                                        <span className="font-mono">{guest.idNumber}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes */}
                    {guest.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic">"{guest.notes}"</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Stats Panel */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stay History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent/10">
                                    <Calendar className="h-4 w-4 text-accent" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Bookings</p>
                                    <p className="font-semibold">{guest.totalBookings} {guest.totalBookings === 1 ? 'booking' : 'bookings'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-status-available/10">
                                    <DollarSign className="h-4 w-4 text-status-available" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Spent</p>
                                    <p className="font-semibold">{formatCurrency(guest.totalSpent)}</p>
                                </div>
                            </div>
                            {guest.vipStatus && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-accent/10">
                                            <Star className="h-4 w-4 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Status</p>
                                            <p className="font-semibold">VIP Member</p>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="text-xs text-muted-foreground pt-2 space-y-1">
                                <div className="flex justify-between">
                                    <span>Member since</span>
                                    <span>{formatDate(guest.createdAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="gold" className="w-full" asChild>
                        <Link to={`/bookings/new?guestId=${guest.id}`}>
                            <Calendar className="h-4 w-4 mr-2" />
                            New Booking for This Guest
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GuestDetail;
