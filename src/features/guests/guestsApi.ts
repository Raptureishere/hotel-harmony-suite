import { api } from '@/app/api';
import type { Guest, GuestFormData, GuestFilters } from '@/types/guest';
import { mockGuests } from '@/utils/mockData';
import { simulateApiDelay } from '@/utils/helpers';

let guests = [...mockGuests];

// Getter for other modules to read live guest data
export const getGuestsData = () => guests;

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
        guests = guests.filter(g => g.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['Guest'],
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
