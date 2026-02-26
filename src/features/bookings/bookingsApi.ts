import { api } from '@/app/api';
import type {
  Booking,
  BookingFormData,
  BookingFilters,
  BookingStatus
} from '@/types/booking';
import { mockBookings } from '@/utils/mockData';
import { simulateApiDelay, calculateNights } from '@/utils/helpers';
import { getRoomsData, updateRoomInPlace } from '@/features/rooms/roomsApi';
import { getGuestsData } from '@/features/guests/guestsApi';
import type { Payment } from '@/types/payment';

// In-memory store
let bookings = [...mockBookings];

// In-memory payments store — entries are created on check-in
let payments: Payment[] = [];

// Getters for dashboardApi / Payments page
export const getBookingsData = () => bookings;
export const getPaymentsData = () => payments;

export const bookingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<Booking[], BookingFilters | void>({
      queryFn: async (filters) => {
        await simulateApiDelay(300);

        let filteredBookings = bookings.map(booking => ({
          ...booking,
          guest: getGuestsData().find(g => g.id === booking.guestId),
          room: getRoomsData().find(r => r.id === booking.roomId),
        }));

        if (filters) {
          if (filters.status) {
            filteredBookings = filteredBookings.filter(b => b.status === filters.status);
          }
          if (filters.paymentStatus) {
            filteredBookings = filteredBookings.filter(b => b.paymentStatus === filters.paymentStatus);
          }
          if (filters.dateFrom) {
            filteredBookings = filteredBookings.filter(b => b.checkInDate >= filters.dateFrom!);
          }
          if (filters.dateTo) {
            filteredBookings = filteredBookings.filter(b => b.checkOutDate <= filters.dateTo!);
          }
          if (filters.guestId) {
            filteredBookings = filteredBookings.filter(b => b.guestId === filters.guestId);
          }
          if (filters.roomId) {
            filteredBookings = filteredBookings.filter(b => b.roomId === filters.roomId);
          }
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filteredBookings = filteredBookings.filter(b =>
              b.guest?.firstName.toLowerCase().includes(search) ||
              b.guest?.lastName.toLowerCase().includes(search) ||
              b.room?.roomNumber.includes(search)
            );
          }
        }

        // Sort by check-in date (most recent first)
        filteredBookings.sort((a, b) =>
          new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
        );

        return { data: filteredBookings };
      },
      providesTags: ['Booking'],
    }),

    getBookingById: builder.query<Booking, string>({
      queryFn: async (id) => {
        await simulateApiDelay(200);
        const booking = bookings.find(b => b.id === id);
        if (!booking) {
          return { error: { status: 404, data: 'Booking not found' } };
        }
        return {
          data: {
            ...booking,
            guest: getGuestsData().find(g => g.id === booking.guestId),
            room: getRoomsData().find(r => r.id === booking.roomId),
          }
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),

    getTodayCheckIns: builder.query<Booking[], void>({
      queryFn: async () => {
        await simulateApiDelay(200);
        const today = new Date().toISOString().split('T')[0];
        const todayCheckIns = bookings
          .filter(b => b.checkInDate === today && b.status !== 'cancelled')
          .map(booking => ({
            ...booking,
            guest: getGuestsData().find(g => g.id === booking.guestId),
            room: getRoomsData().find(r => r.id === booking.roomId),
          }));
        return { data: todayCheckIns };
      },
      providesTags: ['Booking'],
    }),

    getTodayCheckOuts: builder.query<Booking[], void>({
      queryFn: async () => {
        await simulateApiDelay(200);
        const today = new Date().toISOString().split('T')[0];
        const todayCheckOuts = bookings
          .filter(b => b.checkOutDate === today && b.status === 'checked-in')
          .map(booking => ({
            ...booking,
            guest: getGuestsData().find(g => g.id === booking.guestId),
            room: getRoomsData().find(r => r.id === booking.roomId),
          }));
        return { data: todayCheckOuts };
      },
      providesTags: ['Booking'],
    }),

    createBooking: builder.mutation<Booking, BookingFormData>({
      queryFn: async (data) => {
        await simulateApiDelay(500);

        const room = getRoomsData().find(r => r.id === data.roomId);
        if (!room) {
          return { error: { status: 404, data: 'Room not found' } };
        }

        const nights = calculateNights(data.checkInDate, data.checkOutDate);
        const totalAmount = nights * room.pricePerNight;

        const newBooking: Booking = {
          id: String(bookings.length + 1),
          ...data,
          status: 'reserved',
          paymentStatus: 'pending',
          totalAmount,
          paidAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        bookings.push(newBooking);
        return { data: newBooking };
      },
      invalidatesTags: ['Booking', 'Room', 'Dashboard'],
    }),

    updateBooking: builder.mutation<Booking, { id: string; data: Partial<BookingFormData> }>({
      queryFn: async ({ id, data }) => {
        await simulateApiDelay(500);
        const index = bookings.findIndex(b => b.id === id);
        if (index === -1) {
          return { error: { status: 404, data: 'Booking not found' } };
        }
        bookings[index] = {
          ...bookings[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return { data: bookings[index] };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Booking', id }, 'Dashboard'],
    }),

    updateBookingStatus: builder.mutation<Booking, { id: string; status: BookingStatus }>({
      queryFn: async ({ id, status }) => {
        await simulateApiDelay(300);
        const index = bookings.findIndex(b => b.id === id);
        if (index === -1) {
          return { error: { status: 404, data: 'Booking not found' } };
        }

        const booking = bookings[index];

        if (status === 'checked-in') {
          // Mark room as occupied
          updateRoomInPlace(booking.roomId, { status: 'occupied', currentBookingId: booking.id });
          // Mark payment as fully paid
          bookings[index] = {
            ...booking,
            status,
            paymentStatus: 'paid',
            paidAmount: booking.totalAmount,
            updatedAt: new Date().toISOString(),
          };
          // Record a payment entry for the Payments page
          const payment: Payment = {
            id: `pay-${Date.now()}`,
            bookingId: booking.id,
            guestId: booking.guestId,
            amount: booking.totalAmount,
            method: 'card',
            type: 'booking',
            status: 'completed',
            transactionId: `TXN-${Date.now()}`,
            createdAt: new Date().toISOString(),
            processedAt: new Date().toISOString(),
          };
          payments.push(payment);
        } else if (status === 'checked-out') {
          // Free the room for cleaning
          updateRoomInPlace(booking.roomId, { status: 'cleaning', currentBookingId: undefined });
          bookings[index] = {
            ...booking,
            status,
            updatedAt: new Date().toISOString(),
          };
        } else {
          bookings[index] = {
            ...booking,
            status,
            updatedAt: new Date().toISOString(),
          };
        }

        return { data: bookings[index] };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Booking', id }, 'Booking', 'Room', 'Dashboard'],
    }),


    cancelBooking: builder.mutation<Booking, string>({
      queryFn: async (id) => {
        await simulateApiDelay(500);
        const index = bookings.findIndex(b => b.id === id);
        if (index === -1) {
          return { error: { status: 404, data: 'Booking not found' } };
        }
        // Free the room back to available
        updateRoomInPlace(bookings[index].roomId, { status: 'available', currentBookingId: undefined });
        bookings[index] = {
          ...bookings[index],
          status: 'cancelled',
          paymentStatus: 'pending',
          updatedAt: new Date().toISOString(),
        };
        return { data: bookings[index] };
      },
      invalidatesTags: ['Booking', 'Room', 'Dashboard'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useGetTodayCheckInsQuery,
  useGetTodayCheckOutsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useUpdateBookingStatusMutation,
  useCancelBookingMutation,
} = bookingsApi;
