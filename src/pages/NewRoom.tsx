import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BedDouble,
    Plus,
    X,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useCreateRoomMutation } from '@/features/rooms/roomsApi';
import { RoomFormData, RoomType, RoomStatus } from '@/types/room';
import { useToast } from '@/hooks/use-toast';

const ROOM_TYPES: { value: RoomType; label: string }[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'suite', label: 'Suite' },
    { value: 'presidential', label: 'Presidential' },
];

const AMENITY_SUGGESTIONS = [
    'WiFi', 'Air Conditioning', 'Mini Bar', 'Room Service',
    'TV', 'Safe', 'Balcony', 'Ocean View', 'Jacuzzi', 'Kitchen',
    'Bathrobe', 'Slippers', 'Coffee Maker', 'Desk', 'Sofa',
];

const NewRoom = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [createRoom, { isLoading }] = useCreateRoomMutation();

    const [form, setForm] = useState<RoomFormData>({
        roomNumber: '',
        type: 'standard',
        floor: 1,
        pricePerNight: 150,
        status: 'available',
        maxOccupancy: 2,
        amenities: [],
        description: '',
    });

    const [amenityInput, setAmenityInput] = useState('');
    const [errors, setErrors] = useState<Partial<Record<keyof RoomFormData, string>>>({});

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof RoomFormData, string>> = {};
        if (!form.roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
        if (form.floor < 1 || form.floor > 100) newErrors.floor = 'Floor must be between 1 and 100';
        if (form.pricePerNight <= 0) newErrors.pricePerNight = 'Price must be greater than 0';
        if (form.maxOccupancy < 1 || form.maxOccupancy > 20) {
            newErrors.maxOccupancy = 'Occupancy must be between 1 and 20';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddAmenity = (amenity: string) => {
        const trimmed = amenity.trim();
        if (trimmed && !form.amenities.includes(trimmed)) {
            setForm((prev) => ({ ...prev, amenities: [...prev.amenities, trimmed] }));
        }
        setAmenityInput('');
    };

    const handleRemoveAmenity = (amenity: string) => {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.filter((a) => a !== amenity),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await createRoom(form).unwrap();
            toast({
                title: 'Room created',
                description: `Room ${form.roomNumber} has been added successfully.`,
            });
            navigate('/rooms');
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to create room. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/rooms')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Room</h1>
                    <p className="text-muted-foreground">Fill in the room details below</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BedDouble className="h-5 w-5 text-accent" />
                                    Room Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="roomNumber">Room Number *</Label>
                                        <Input
                                            id="roomNumber"
                                            placeholder="e.g. 101"
                                            value={form.roomNumber}
                                            onChange={(e) =>
                                                setForm((prev) => ({ ...prev, roomNumber: e.target.value }))
                                            }
                                            className={errors.roomNumber ? 'border-destructive' : ''}
                                        />
                                        {errors.roomNumber && (
                                            <p className="text-xs text-destructive">{errors.roomNumber}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type">Room Type *</Label>
                                        <Select
                                            value={form.type}
                                            onValueChange={(v) =>
                                                setForm((prev) => ({ ...prev, type: v as RoomType }))
                                            }
                                        >
                                            <SelectTrigger id="type">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROOM_TYPES.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="floor">Floor *</Label>
                                        <Input
                                            id="floor"
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={form.floor}
                                            onChange={(e) =>
                                                setForm((prev) => ({ ...prev, floor: parseInt(e.target.value) || 1 }))
                                            }
                                            className={errors.floor ? 'border-destructive' : ''}
                                        />
                                        {errors.floor && (
                                            <p className="text-xs text-destructive">{errors.floor}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
                                        <Input
                                            id="maxOccupancy"
                                            type="number"
                                            min={1}
                                            max={20}
                                            value={form.maxOccupancy}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    maxOccupancy: parseInt(e.target.value) || 1,
                                                }))
                                            }
                                            className={errors.maxOccupancy ? 'border-destructive' : ''}
                                        />
                                        {errors.maxOccupancy && (
                                            <p className="text-xs text-destructive">{errors.maxOccupancy}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pricePerNight">Price Per Night (USD) *</Label>
                                        <Input
                                            id="pricePerNight"
                                            type="number"
                                            min={1}
                                            step={0.01}
                                            value={form.pricePerNight}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    pricePerNight: parseFloat(e.target.value) || 0,
                                                }))
                                            }
                                            className={errors.pricePerNight ? 'border-destructive' : ''}
                                        />
                                        {errors.pricePerNight && (
                                            <p className="text-xs text-destructive">{errors.pricePerNight}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Initial Status *</Label>
                                        <Select
                                            value={form.status}
                                            onValueChange={(v) =>
                                                setForm((prev) => ({ ...prev, status: v as RoomStatus }))
                                            }
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter a brief description of the room..."
                                        rows={3}
                                        value={form.description || ''}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Amenities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Amenities</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type an amenity and press Enter..."
                                        value={amenityInput}
                                        onChange={(e) => setAmenityInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddAmenity(amenityInput);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleAddAmenity(amenityInput)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Suggestions */}
                                <div className="flex flex-wrap gap-2">
                                    {AMENITY_SUGGESTIONS.filter(
                                        (a) => !form.amenities.includes(a)
                                    ).map((amenity) => (
                                        <button
                                            key={amenity}
                                            type="button"
                                            className="text-xs px-2 py-1 rounded-full border border-dashed hover:border-accent hover:text-accent transition-colors"
                                            onClick={() => handleAddAmenity(amenity)}
                                        >
                                            + {amenity}
                                        </button>
                                    ))}
                                </div>

                                {/* Selected */}
                                {form.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                                        {form.amenities.map((amenity) => (
                                            <Badge
                                                key={amenity}
                                                variant="secondary"
                                                className="gap-1 pr-1"
                                            >
                                                {amenity}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAmenity(amenity)}
                                                    className="hover:text-destructive ml-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Panel */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Room Number</span>
                                    <span className="font-medium">{form.roomNumber || '—'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Type</span>
                                    <span className="font-medium capitalize">{form.type}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Floor</span>
                                    <span className="font-medium">{form.floor}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Max Guests</span>
                                    <span className="font-medium">{form.maxOccupancy}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Price/Night</span>
                                    <span className="font-medium">
                                        ${form.pricePerNight.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Amenities</span>
                                    <span className="font-medium">{form.amenities.length}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            variant="gold"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Room'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate('/rooms')}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewRoom;
