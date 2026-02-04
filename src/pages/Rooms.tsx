import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  BedDouble,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetRoomsQuery, useUpdateRoomStatusMutation, useDeleteRoomMutation } from '@/features/rooms/roomsApi';
import { formatCurrency, getRoomTypeLabel, getRoomStatusLabel } from '@/utils/helpers';
import { RoomStatus, RoomType, Room } from '@/types/room';
import { useToast } from '@/hooks/use-toast';

const Rooms = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RoomType | 'all'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const { data: rooms = [], isLoading } = useGetRoomsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    search: search || undefined,
  });
  const [updateStatus] = useUpdateRoomStatusMutation();
  const [deleteRoom] = useDeleteRoomMutation();
  const { toast } = useToast();

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    try {
      await updateStatus({ id: roomId, status: newStatus }).unwrap();
      toast({
        title: 'Status updated',
        description: `Room status changed to ${getRoomStatusLabel(newStatus)}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update room status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoom(selectedRoom.id).unwrap();
      toast({
        title: 'Room deleted',
        description: `Room ${selectedRoom.roomNumber} has been deleted`,
      });
      setDeleteDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive',
      });
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !room.roomNumber.toLowerCase().includes(searchLower) &&
        !room.type.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  const statusCounts = {
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    cleaning: rooms.filter((r) => r.status === 'cleaning').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">
            Manage your hotel rooms and their availability
          </p>
        </div>
        <Button variant="gold" asChild>
          <Link to="/rooms/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Link>
        </Button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          variant="interactive"
          className={statusFilter === 'available' ? 'ring-2 ring-accent' : ''}
          onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-available/10">
              <BedDouble className="h-5 w-5 text-status-available" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.available}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          className={statusFilter === 'occupied' ? 'ring-2 ring-accent' : ''}
          onClick={() => setStatusFilter(statusFilter === 'occupied' ? 'all' : 'occupied')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-occupied/10">
              <BedDouble className="h-5 w-5 text-status-occupied" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.occupied}</p>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          className={statusFilter === 'cleaning' ? 'ring-2 ring-accent' : ''}
          onClick={() => setStatusFilter(statusFilter === 'cleaning' ? 'all' : 'cleaning')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-cleaning/10">
              <BedDouble className="h-5 w-5 text-status-cleaning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.cleaning}</p>
              <p className="text-sm text-muted-foreground">Cleaning</p>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          className={statusFilter === 'maintenance' ? 'ring-2 ring-accent' : ''}
          onClick={() => setStatusFilter(statusFilter === 'maintenance' ? 'all' : 'maintenance')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-maintenance/10">
              <BedDouble className="h-5 w-5 text-status-maintenance" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.maintenance}</p>
              <p className="text-sm text-muted-foreground">Maintenance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as RoomType | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="presidential">Presidential</SelectItem>
              </SelectContent>
            </Select>
            {(statusFilter !== 'all' || typeFilter !== 'all' || search) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear Filters
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
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BedDouble className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No rooms found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Price/Night</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div className="font-medium">Room {room.roomNumber}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getRoomTypeLabel(room.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>Floor {room.floor}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(room.pricePerNight)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={room.status}
                          onValueChange={(v) => handleStatusChange(room.id, v as RoomStatus)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <Badge variant={room.status} className="font-normal">
                              {getRoomStatusLabel(room.status)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="occupied">Occupied</SelectItem>
                            <SelectItem value="cleaning">Cleaning</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{room.maxOccupancy} guests</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/rooms/${room.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/rooms/${room.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedRoom(room);
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
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Room {selectedRoom?.roomNumber}? This action cannot be undone.
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

export default Rooms;
