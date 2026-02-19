import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    BedDouble,
    Edit,
    Trash2,
    Users,
    DollarSign,
    Layers,
    CheckCircle,
    Wifi,
    Clock,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGetRoomByIdQuery, useUpdateRoomStatusMutation, useDeleteRoomMutation } from '@/features/rooms/roomsApi';
import { formatCurrency, getRoomStatusLabel } from '@/utils/helpers';
import { RoomStatus } from '@/types/room';
import { useToast } from '@/hooks/use-toast';

const RoomDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data: room, isLoading, isError } = useGetRoomByIdQuery(id!);
    const [updateStatus] = useUpdateRoomStatusMutation();
    const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

    const handleStatusChange = async (status: RoomStatus) => {
        if (!room) return;
        try {
            await updateStatus({ id: room.id, status }).unwrap();
            toast({ title: 'Status updated', description: `Room ${room.roomNumber} is now ${getRoomStatusLabel(status)}.` });
        } catch {
            toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
        }
    };

    const handleDelete = async () => {
        if (!room) return;
        try {
            await deleteRoom(room.id).unwrap();
            toast({ title: 'Room deleted', description: `Room ${room.roomNumber} has been removed.` });
            navigate('/rooms');
        } catch {
            toast({ title: 'Error', description: 'Failed to delete room.', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading room details...</div>
            </div>
        );
    }

    if (isError || !room) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <BedDouble className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Room not found.</p>
                <Button variant="outline" onClick={() => navigate('/rooms')}>
                    Back to Rooms
                </Button>
            </div>
        );
    }

    const statusVariantMap: Record<RoomStatus, 'available' | 'occupied' | 'cleaning' | 'maintenance'> = {
        available: 'available',
        occupied: 'occupied',
        cleaning: 'cleaning',
        maintenance: 'maintenance',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/rooms')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">Room {room.roomNumber}</h1>
                            <Badge variant={statusVariantMap[room.status]}>{getRoomStatusLabel(room.status)}</Badge>
                        </div>
                        <p className="text-muted-foreground capitalize">{room.type} — Floor {room.floor}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/rooms/${room.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Room
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
                                <AlertDialogTitle>Delete Room {room.roomNumber}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. All associated booking history will be preserved but the room will be removed from the system.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { icon: BedDouble, label: 'Type', value: room.type, capitalize: true },
                                    { icon: Layers, label: 'Floor', value: `Floor ${room.floor}` },
                                    { icon: Users, label: 'Max Guests', value: `${room.maxOccupancy} guests` },
                                    { icon: DollarSign, label: 'Price/Night', value: formatCurrency(room.pricePerNight) },
                                ].map((stat) => (
                                    <div key={stat.label} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                                        <stat.icon className="h-5 w-5 text-accent" />
                                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                                        <p className={`text-sm font-semibold ${stat.capitalize ? 'capitalize' : ''}`}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                            {room.description && (
                                <>
                                    <Separator className="my-4" />
                                    <p className="text-sm text-muted-foreground">{room.description}</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Amenities */}
                    {room.amenities.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wifi className="h-5 w-5 text-accent" />
                                    Amenities
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {room.amenities.map((amenity) => (
                                        <div key={amenity} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm">
                                            <CheckCircle className="h-3.5 w-3.5 text-status-available" />
                                            {amenity}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={room.status} onValueChange={(v) => handleStatusChange(v as RoomStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="occupied">Occupied</SelectItem>
                                    <SelectItem value="cleaning">Cleaning</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {room.lastCleaned && (
                        <Card>
                            <CardContent className="p-4 flex items-start gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Last Cleaned</p>
                                    <p className="text-sm font-medium">{new Date(room.lastCleaned).toLocaleDateString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Button variant="gold" className="w-full" asChild>
                        <Link to="/bookings/new">Create Booking for This Room</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RoomDetail;
