import { api } from '@/app/api';
import type { Staff, StaffFormData, ActivityLog } from '@/types/staff';
import { simulateApiDelay } from '@/utils/helpers';

/* ─── In-Memory Store ───────────────────────────── */
let staffMemory: Staff[] = [
    {
        id: 'staff-1',
        userId: 'user-admin-1',
        name: 'Admin User',
        email: 'admin@grandhotel.com',
        phone: '+233 30 222 0001',
        role: 'admin',
        department: 'Management',
        hireDate: '2022-01-15',
        isActive: true,
        permissions: ['all'],
        createdAt: '2022-01-15T09:00:00.000Z',
        updatedAt: '2022-01-15T09:00:00.000Z',
    },
    {
        id: 'staff-2',
        userId: 'user-mgr-1',
        name: 'Ama Owusu',
        email: 'ama.owusu@grandhotel.com',
        phone: '+233 30 222 0002',
        role: 'manager',
        department: 'Front Desk',
        hireDate: '2022-06-01',
        isActive: true,
        permissions: ['manage_bookings', 'manage_rooms', 'view_reports'],
        createdAt: '2022-06-01T09:00:00.000Z',
        updatedAt: '2022-06-01T09:00:00.000Z',
    },
    {
        id: 'staff-3',
        userId: 'user-rec-1',
        name: 'Kwame Mensah',
        email: 'kwame.mensah@grandhotel.com',
        phone: '+233 30 222 0003',
        role: 'receptionist',
        department: 'Front Desk',
        hireDate: '2023-03-10',
        isActive: true,
        permissions: ['manage_bookings', 'view_guests'],
        createdAt: '2023-03-10T09:00:00.000Z',
        updatedAt: '2023-03-10T09:00:00.000Z',
    },
    {
        id: 'staff-4',
        userId: 'user-rec-2',
        name: 'Efua Asante',
        email: 'efua.asante@grandhotel.com',
        phone: '+233 30 222 0004',
        role: 'receptionist',
        department: 'Housekeeping',
        hireDate: '2023-08-22',
        isActive: false,
        permissions: ['view_rooms'],
        createdAt: '2023-08-22T09:00:00.000Z',
        updatedAt: '2024-01-06T09:00:00.000Z',
    },
];

let activityLogsMemory: ActivityLog[] = [
    {
        id: 'log-1',
        staffId: 'staff-1',
        action: 'login',
        entityType: 'staff',
        entityId: 'staff-1',
        details: 'Admin logged in',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'log-2',
        staffId: 'staff-2',
        action: 'check_in',
        entityType: 'booking',
        entityId: 'booking-001',
        details: 'Checked in guest for Room 101',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'log-3',
        staffId: 'staff-3',
        action: 'booking_created',
        entityType: 'booking',
        entityId: 'booking-002',
        details: 'Created new reservation for Room 205',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
];

export const getStaffData = () => staffMemory;

/* ─── RTK Query API (injected into shared api) ─── */
export const staffApi = api.injectEndpoints({
    endpoints: (builder) => ({

        getStaff: builder.query<Staff[], { search?: string } | void>({
            queryFn: async (args) => {
                await simulateApiDelay(200);
                let list = [...staffMemory];
                if (args?.search) {
                    const q = args.search.toLowerCase();
                    list = list.filter(s =>
                        s.name.toLowerCase().includes(q) ||
                        s.email.toLowerCase().includes(q) ||
                        s.role.toLowerCase().includes(q) ||
                        s.department.toLowerCase().includes(q)
                    );
                }
                return { data: list };
            },
            providesTags: ['Staff'],
        }),

        addStaff: builder.mutation<Staff, StaffFormData>({
            queryFn: async (form) => {
                await simulateApiDelay(400);
                const newStaff: Staff = {
                    id: `staff-${Date.now()}`,
                    userId: `user-${Date.now()}`,
                    ...form,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                staffMemory.push(newStaff);
                activityLogsMemory.unshift({
                    id: `log-${Date.now()}`,
                    staffId: newStaff.id,
                    action: 'staff_added',
                    entityType: 'staff',
                    entityId: newStaff.id,
                    details: `New staff member ${newStaff.name} (${newStaff.role}) added`,
                    createdAt: new Date().toISOString(),
                });
                return { data: newStaff };
            },
            invalidatesTags: ['Staff'],
        }),

        updateStaff: builder.mutation<Staff, { id: string } & Partial<StaffFormData>>({
            queryFn: async ({ id, ...updates }) => {
                await simulateApiDelay(300);
                const idx = staffMemory.findIndex(s => s.id === id);
                if (idx === -1) return { error: { status: 404, data: 'Staff not found' } };
                staffMemory[idx] = { ...staffMemory[idx], ...updates, updatedAt: new Date().toISOString() };
                return { data: staffMemory[idx] };
            },
            invalidatesTags: ['Staff'],
        }),

        toggleStaffStatus: builder.mutation<Staff, string>({
            queryFn: async (id) => {
                await simulateApiDelay(200);
                const idx = staffMemory.findIndex(s => s.id === id);
                if (idx === -1) return { error: { status: 404, data: 'Staff not found' } };
                staffMemory[idx] = {
                    ...staffMemory[idx],
                    isActive: !staffMemory[idx].isActive,
                    updatedAt: new Date().toISOString(),
                };
                activityLogsMemory.unshift({
                    id: `log-${Date.now()}`,
                    staffId: id,
                    action: staffMemory[idx].isActive ? 'staff_activated' : 'staff_deactivated',
                    entityType: 'staff',
                    entityId: id,
                    details: `${staffMemory[idx].name} was ${staffMemory[idx].isActive ? 'activated' : 'deactivated'}`,
                    createdAt: new Date().toISOString(),
                });
                return { data: staffMemory[idx] };
            },
            invalidatesTags: ['Staff'],
        }),

        deleteStaff: builder.mutation<void, string>({
            queryFn: async (id) => {
                await simulateApiDelay(300);
                staffMemory = staffMemory.filter(s => s.id !== id);
                return { data: undefined };
            },
            invalidatesTags: ['Staff'],
        }),

        getActivityLogs: builder.query<ActivityLog[], void>({
            queryFn: async () => {
                await simulateApiDelay(200);
                return { data: [...activityLogsMemory] };
            },
            providesTags: ['Staff'],
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetStaffQuery,
    useAddStaffMutation,
    useUpdateStaffMutation,
    useToggleStaffStatusMutation,
    useDeleteStaffMutation,
    useGetActivityLogsQuery,
} = staffApi;
