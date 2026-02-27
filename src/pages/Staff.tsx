import { useState } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  UserX,
  UserCheck,
  Shield,
  Users,
  UserCog,
  Activity,
  Trash2,
  X,
  Save,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useGetStaffQuery,
  useAddStaffMutation,
  useUpdateStaffMutation,
  useToggleStaffStatusMutation,
  useDeleteStaffMutation,
  useGetActivityLogsQuery,
} from '@/features/staff/staffApi';
import type { Staff as StaffType, StaffFormData } from '@/types/staff';
import type { UserRole } from '@/types/auth';
import { formatDateTime, getInitials } from '@/utils/helpers';
import { useAppSelector } from '@/hooks/useAppStore';
import { useToast } from '@/hooks/use-toast';

/* ─── default form ──────────────────────────────── */
const emptyForm = (): StaffFormData => ({
  name: '',
  email: '',
  phone: '',
  role: 'receptionist',
  department: '',
  hireDate: new Date().toISOString().split('T')[0],
  permissions: [],
});

/* ─── Staff Form Modal ──────────────────────────── */
const StaffFormModal = ({
  open,
  onClose,
  initial,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  initial: StaffFormData;
  onSubmit: (data: StaffFormData) => void;
  isLoading: boolean;
}) => {
  const [form, setForm] = useState<StaffFormData>(initial);
  const set = (key: keyof StaffFormData, val: unknown) =>
    setForm(p => ({ ...p, [key]: val }));

  // Reset form when modal opens with new initial
  const handleOpen = () => setForm(initial);
  void handleOpen;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-accent" />
            {initial.name ? 'Edit Staff Member' : 'Add Staff Member'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="s-name">Full Name *</Label>
              <Input
                id="s-name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="s-email">Email *</Label>
              <Input
                id="s-email"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="staff@grandhotel.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-phone">Phone</Label>
              <Input
                id="s-phone"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+233 30 000 0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-hire">Hire Date</Label>
              <Input
                id="s-hire"
                type="date"
                value={form.hireDate}
                onChange={e => set('hireDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-role">Role *</Label>
              <Select value={form.role} onValueChange={v => set('role', v as UserRole)}>
                <SelectTrigger id="s-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-dept">Department</Label>
              <Select value={form.department} onValueChange={v => set('department', v)}>
                <SelectTrigger id="s-dept">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Front Desk">Front Desk</SelectItem>
                  <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="Food & Beverage">Food &amp; Beverage</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            variant="gold"
            disabled={isLoading || !form.name || !form.email}
            onClick={() => onSubmit(form)}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Main Component ────────────────────────────── */
const Staff = () => {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffType | null>(null);

  const { user } = useAppSelector(state => state.auth);
  const { toast } = useToast();

  const { data: staffList = [], isLoading } = useGetStaffQuery({ search: search || undefined });
  const { data: activityLogs = [] } = useGetActivityLogsQuery();
  const [addStaff, { isLoading: isAdding }] = useAddStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const [toggleStatus] = useToggleStaffStatusMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Shield className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Only administrators can access staff management.</p>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'default' as const;
    if (role === 'manager') return 'info' as const;
    return 'secondary' as const;
  };

  const handleAdd = async (form: StaffFormData) => {
    try {
      await addStaff(form).unwrap();
      toast({ title: 'Staff member added', description: `${form.name} has been added to the team.` });
      setAddOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to add staff member.', variant: 'destructive' });
    }
  };

  const handleEdit = async (form: StaffFormData) => {
    if (!editTarget) return;
    try {
      await updateStaff({ id: editTarget.id, ...form }).unwrap();
      toast({ title: 'Staff updated', description: `${form.name}'s details have been updated.` });
      setEditTarget(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to update staff member.', variant: 'destructive' });
    }
  };

  const handleToggle = async (staff: StaffType) => {
    try {
      await toggleStatus(staff.id).unwrap();
      toast({
        title: staff.isActive ? 'Staff deactivated' : 'Staff activated',
        description: `${staff.name} has been ${staff.isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStaff(deleteTarget.id).unwrap();
      toast({ title: 'Staff removed', description: `${deleteTarget.name} has been removed.` });
      setDeleteTarget(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete staff member.', variant: 'destructive' });
    }
  };

  const logsWithStaff = activityLogs.map(log => ({
    ...log,
    staff: staffList.find(s => s.id === log.staffId),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff accounts and permissions</p>
        </div>
        <Button variant="gold" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{staffList.length}</p>
              <p className="text-sm text-muted-foreground">Total Staff</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-available/10">
              <UserCog className="h-5 w-5 text-status-available" />
            </div>
            <div>
              <p className="text-2xl font-bold">{staffList.filter(s => s.isActive).length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{staffList.filter(s => s.role === 'admin').length}</p>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff" className="gap-2">
            <Users className="h-4 w-4" /> Staff List
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" /> Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Staff List Tab */}
        <TabsContent value="staff" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <p className="p-6 text-muted-foreground">Loading...</p>
              ) : staffList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Users className="h-10 w-10 mb-3 opacity-30" />
                  <p className="font-medium">No staff members found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[70px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffList.map(staff => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {getInitials(staff.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{staff.name}</p>
                                <p className="text-sm text-muted-foreground">{staff.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(staff.role)}>
                              {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{staff.department || '—'}</TableCell>
                          <TableCell className="text-muted-foreground">{staff.phone}</TableCell>
                          <TableCell>
                            <Badge variant={staff.isActive ? 'success' : 'secondary'}>
                              {staff.isActive ? 'Active' : 'Inactive'}
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
                                <DropdownMenuItem onClick={() => setEditTarget(staff)}>
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggle(staff)}>
                                  {staff.isActive
                                    ? <><UserX className="h-4 w-4 mr-2" /> Deactivate</>
                                    : <><UserCheck className="h-4 w-4 mr-2" /> Activate</>
                                  }
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteTarget(staff)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Remove
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
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {logsWithStaff.length === 0 ? (
                <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {logsWithStaff.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border border-white/10">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {log.staff?.name ? getInitials(log.staff.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{log.staff?.name || 'Unknown'}</p>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatDateTime(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Modal */}
      <StaffFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        initial={emptyForm()}
        onSubmit={handleAdd}
        isLoading={isAdding}
      />

      {/* Edit Staff Modal */}
      {editTarget && (
        <StaffFormModal
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          initial={{
            name: editTarget.name,
            email: editTarget.email,
            phone: editTarget.phone,
            role: editTarget.role,
            department: editTarget.department,
            hireDate: editTarget.hireDate,
            permissions: editTarget.permissions,
          }}
          onSubmit={handleEdit}
          isLoading={isUpdating}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong> from the system. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Staff;
