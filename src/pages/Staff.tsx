import { useState } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  UserX,
  Shield,
  Users,
  UserCog,
  Activity,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockStaff, mockActivityLogs } from '@/utils/mockData';
import { formatDateTime, getInitials } from '@/utils/helpers';
import { useAppSelector } from '@/hooks/useAppStore';

const Staff = () => {
  const [search, setSearch] = useState('');
  const { user } = useAppSelector((state) => state.auth);
  
  // Only admins can access this page
  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Shield className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          Only administrators can access staff management.
        </p>
      </div>
    );
  }

  const filteredStaff = mockStaff.filter((staff) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        staff.name.toLowerCase().includes(searchLower) ||
        staff.email.toLowerCase().includes(searchLower) ||
        staff.role.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'manager':
        return 'info';
      case 'receptionist':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const logsWithStaff = mockActivityLogs.map((log) => ({
    ...log,
    staff: mockStaff.find((s) => s.id === log.staffId),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff accounts and permissions
          </p>
        </div>
        <Button variant="gold">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
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
              <p className="text-2xl font-bold">{mockStaff.length}</p>
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
              <p className="text-2xl font-bold">
                {mockStaff.filter((s) => s.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockStaff.filter((s) => s.role === 'admin').length}
              </p>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff" className="gap-2">
            <Users className="h-4 w-4" />
            Staff List
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={staff.avatar} alt={staff.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(staff.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {staff.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(staff.role)}>
                            {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{staff.department}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {staff.phone}
                        </TableCell>
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Permissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logsWithStaff.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={log.staff?.avatar} alt={log.staff?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {log.staff?.name ? getInitials(log.staff.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{log.staff?.name || 'Unknown'}</p>
                        <Badge variant="secondary" className="text-xs">
                          {log.action.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.details}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Staff;
