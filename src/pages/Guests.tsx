import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Star,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetGuestsQuery, useDeleteGuestMutation } from '@/features/guests/guestsApi';
import { formatCurrency, getInitials } from '@/utils/helpers';
import { Guest } from '@/types/guest';
import { useToast } from '@/hooks/use-toast';

const Guests = () => {
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  
  const { data: guests = [], isLoading } = useGetGuestsQuery({ search: search || undefined });
  const [deleteGuest] = useDeleteGuestMutation();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedGuest) return;
    try {
      await deleteGuest(selectedGuest.id).unwrap();
      toast({
        title: 'Guest deleted',
        description: `${selectedGuest.firstName} ${selectedGuest.lastName} has been removed`,
      });
      setDeleteDialogOpen(false);
      setSelectedGuest(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete guest',
        variant: 'destructive',
      });
    }
  };

  const vipCount = guests.filter((g) => g.vipStatus).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest Management</h1>
          <p className="text-muted-foreground">
            Manage your hotel guests and their information
          </p>
        </div>
        <Button variant="gold" asChild>
          <Link to="/guests/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{guests.length}</p>
              <p className="text-sm text-muted-foreground">Total Guests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Star className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vipCount}</p>
              <p className="text-sm text-muted-foreground">VIP Guests</p>
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-available/10">
              <Users className="h-5 w-5 text-status-available" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(guests.reduce((sum, g) => sum + g.totalSpent, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Total Revenue from Guests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guests Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {search && (
              <Button variant="ghost" onClick={() => setSearch('')}>
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
          ) : guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No guests found</p>
              <p className="text-sm text-muted-foreground">
                Add a new guest to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(`${guest.firstName} ${guest.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {guest.firstName} {guest.lastName}
                            </p>
                            {guest.vipStatus && (
                              <Badge variant="vip" className="mt-1">
                                <Star className="h-3 w-3 mr-1" />
                                VIP
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {guest.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {guest.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{guest.country || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{guest.totalBookings}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(guest.totalSpent)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">Active</Badge>
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
                              <Link to={`/guests/${guest.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/guests/${guest.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedGuest(guest);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Guest</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedGuest?.firstName} {selectedGuest?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Guests;
