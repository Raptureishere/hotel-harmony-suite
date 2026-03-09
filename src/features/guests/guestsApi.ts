import { api } from '@/app/api';
import type { Guest, GuestFormData, GuestFilters } from '@/types/guest';
import { mockGuests } from '@/utils/mockData';
import { simulateApiDelay } from '@/utils/helpers';
import { getBookingsData, getPaymentsData } from '@/features/bookings/bookingsApi';
import { updateRoomInPlace } from '@/features/rooms/roomsApi';

let guests = [...mockGuests];

// Getter for other modules to read live guest data
export const getGuestsData = () => guests;

/** Called by bookingsApi to keep guest aggregate stats in sync */
export const updateGuestTotals = (
  guestId: string,
  delta: { bookings?: number; spent?: number }
) => {
  const idx = guests.findIndex(g => g.id === guestId);
  if (idx === -1) return;
  guests[idx] = {
    ...guests[idx],
    totalBookings: guests[idx].totalBookings + (delta.bookings ?? 0),
    totalSpent: guests[idx].totalSpent + (delta.spent ?? 0),
    updatedAt: new Date().toISOString(),
  };
};

export const guestsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGuests: builder.query<Guest[], GuestFilters | void>({
      queryFn: async (filters) => {
        await simulateApiDelay(300);

        let filteredGuests = [...guests];

        if (filters) {
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filteredGuests = filteredGuests.filter(g =>
              g.firstName.toLowerCase().includes(search) ||
              g.lastName.toLowerCase().includes(search) ||
              g.email.toLowerCase().includes(search) ||
              g.phone.includes(search)
            );
          }
          if (filters.vipStatus !== undefined) {
            filteredGuests = filteredGuests.filter(g => g.vipStatus === filters.vipStatus);
          }
          if (filters.country) {
            filteredGuests = filteredGuests.filter(g => g.country === filters.country);
          }
        }

        return { data: filteredGuests };
      },
      providesTags: ['Guest'],
    }),

    getGuestById: builder.query<Guest, string>({
      queryFn: async (id) => {
        await simulateApiDelay(200);
        const guest = guests.find(g => g.id === id);
        if (!guest) {
          return { error: { status: 404, data: 'Guest not found' } };
        }
        return { data: guest };
      },
      providesTags: (_result, _error, id) => [{ type: 'Guest', id }],
    }),

    createGuest: builder.mutation<Guest, GuestFormData>({
      queryFn: async (data) => {
        await simulateApiDelay(500);
        const newGuest: Guest = {
          id: String(guests.length + 1),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalBookings: 0,
          totalSpent: 0,
        };
        guests.push(newGuest);
        return { data: newGuest };
      },
      invalidatesTags: ['Guest'],
    }),

    updateGuest: builder.mutation<Guest, { id: string; data: Partial<GuestFormData> }>({
      queryFn: async ({ id, data }) => {
        await simulateApiDelay(500);
        const index = guests.findIndex(g => g.id === id);
        if (index === -1) {
          return { error: { status: 404, data: 'Guest not found' } };
        }
        guests[index] = {
          ...guests[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return { data: guests[index] };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Guest', id }],
    }),

    deleteGuest: builder.mutation<void, string>({
      queryFn: async (id) => {
        await simulateApiDelay(500);

        // 1. Find all bookings for this guest
        const allBookings = getBookingsData();
        const guestBookings = allBookings.filter(b => b.guestId === id);

        // 2. Free rooms that were occupied or reserved by this guest
        for (const booking of guestBookings) {
          if (booking.status === 'checked-in') {
            updateRoomInPlace(booking.roomId, { status: 'cleaning' });
          } else if (booking.status === 'reserved') {
            updateRoomInPlace(booking.roomId, { status: 'available' });
          }
        }

        // 3. Remove payment records for this guest
        const payments = getPaymentsData();
        const bookingIds = new Set(guestBookings.map(b => b.id));
        const idx = payments.findIndex(p => bookingIds.has(p.bookingId));
        if (idx !== -1) payments.splice(idx, 1);
        // Remove all payment records for guest's bookings in-place
        for (let i = payments.length - 1; i >= 0; i--) {
          if (bookingIds.has(payments[i].bookingId)) payments.splice(i, 1);
        }

        // 4. Remove the guest's bookings from the bookings array
        const bookingsArr = getBookingsData();
        for (let i = bookingsArr.length - 1; i >= 0; i--) {
          if (bookingsArr[i].guestId === id) bookingsArr.splice(i, 1);
        }

        // 5. Remove the guest
        guests = guests.filter(g => g.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['Guest', 'Booking', 'Room', 'Dashboard'],
    }),
  }),
});

export const {
  useGetGuestsQuery,
  useGetGuestByIdQuery,
  useCreateGuestMutation,
  useUpdateGuestMutation,
  useDeleteGuestMutation,
} = guestsApi;
