import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
    useGetGuestByIdQuery,
    useUpdateGuestMutation,
} from '@/features/guests/guestsApi';
import { GuestFormData } from '@/types/guest';
import { useToast } from '@/hooks/use-toast';

const EditGuest = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data: guest, isLoading } = useGetGuestByIdQuery(id!);
    const [updateGuest, { isLoading: isSaving }] = useUpdateGuestMutation();

    const [form, setForm] = useState<GuestFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        nationality: '',
        idType: undefined,
        idNumber: '',
        dateOfBirth: '',
        notes: '',
        vipStatus: false,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof GuestFormData, string>>>({});

    useEffect(() => {
        if (guest) {
            setForm({
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email,
                phone: guest.phone,
                address: guest.address || '',
                city: guest.city || '',
                country: guest.country || '',
                nationality: guest.nationality || '',
                idType: guest.idType,
                idNumber: guest.idNumber || '',
                dateOfBirth: guest.dateOfBirth || '',
                notes: guest.notes || '',
                vipStatus: guest.vipStatus || false,
            });
        }
    }, [guest]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof GuestFormData, string>> = {};
        if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!form.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !id) return;
        try {
            await updateGuest({ id, ...form }).unwrap();
            toast({ title: 'Guest updated', description: `${form.firstName} ${form.lastName} has been updated.` });
            navigate(`/guests/${id}`);
        } catch {
            toast({ title: 'Error', description: 'Failed to update guest.', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading guest...</div>
            </div>
        );
    }

    if (!guest) {
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
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/guests/${id}`)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Guest — {guest.firstName} {guest.lastName}
                    </h1>
                    <p className="text-muted-foreground">Update guest profile details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-accent" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input id="firstName" value={form.firstName}
                                            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                                            className={errors.firstName ? 'border-destructive' : ''} />
                                        {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input id="lastName" value={form.lastName}
                                            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                                            className={errors.lastName ? 'border-destructive' : ''} />
                                        {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input id="email" type="email" value={form.email}
                                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                            className={errors.email ? 'border-destructive' : ''} />
                                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone *</Label>
                                        <Input id="phone" value={form.phone}
                                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                            className={errors.phone ? 'border-destructive' : ''} />
                                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                        <Input id="dateOfBirth" type="date" value={form.dateOfBirth || ''}
                                            onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nationality">Nationality</Label>
                                        <Input id="nationality" value={form.nationality || ''}
                                            onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Address</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Street Address</Label>
                                    <Input id="address" value={form.address || ''}
                                        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" value={form.city || ''}
                                            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" value={form.country || ''}
                                            onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Identification</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="idType">ID Type</Label>
                                        <Select value={form.idType || ''}
                                            onValueChange={(v) => setForm((p) => ({ ...p, idType: v as GuestFormData['idType'] }))}>
                                            <SelectTrigger id="idType"><SelectValue placeholder="Select ID type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="passport">Passport</SelectItem>
                                                <SelectItem value="national_id">National ID</SelectItem>
                                                <SelectItem value="drivers_license">Driver's License</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="idNumber">ID Number</Label>
                                        <Input id="idNumber" value={form.idNumber || ''}
                                            onChange={(e) => setForm((p) => ({ ...p, idNumber: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea id="notes" rows={3} value={form.notes || ''}
                                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">VIP Guest</p>
                                        <p className="text-sm text-muted-foreground">Mark as a VIP member</p>
                                    </div>
                                    <Switch
                                        checked={form.vipStatus || false}
                                        onCheckedChange={(v) => setForm((p) => ({ ...p, vipStatus: v }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" variant="gold" className="w-full" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={() => navigate(`/guests/${id}`)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditGuest;
