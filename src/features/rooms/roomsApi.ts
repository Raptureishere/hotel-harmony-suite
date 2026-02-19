import { api } from '@/app/api';
import type {
  Room,
  RoomFormData,
  RoomFilters,
  RoomStatus
} from '@/types/room';
import { mockRooms } from '@/utils/mockData';
import { simulateApiDelay } from '@/utils/helpers';

// In-memory store — starts empty, populated via createRoom mutations
let rooms = [...mockRooms];

// Getter for other modules (e.g. dashboardApi) to read live data
export const getRoomsData = () => rooms;

// Direct mutator for cross-module use (e.g. bookingsApi on check-in)
export const updateRoomInPlace = (roomId: string, patch: Partial<Room>) => {
  const idx = rooms.findIndex(r => r.id === roomId);
  if (idx !== -1) rooms[idx] = { ...rooms[idx], ...patch };
};

export const roomsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query<Room[], RoomFilters | void>({
      queryFn: async (filters) => {
        await simulateApiDelay(300);

        let filteredRooms = [...rooms];

        if (filters) {
          if (filters.status) {
            filteredRooms = filteredRooms.filter(r => r.status === filters.status);
          }
          if (filters.type) {
            filteredRooms = filteredRooms.filter(r => r.type === filters.type);
          }
          if (filters.floor) {
            filteredRooms = filteredRooms.filter(r => r.floor === filters.floor);
          }
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filteredRooms = filteredRooms.filter(r =>
              r.roomNumber.toLowerCase().includes(search) ||
              r.type.toLowerCase().includes(search)
            );
          }
          if (filters.minPrice !== undefined) {
            filteredRooms = filteredRooms.filter(r => r.pricePerNight >= filters.minPrice!);
          }
          if (filters.maxPrice !== undefined) {
            filteredRooms = filteredRooms.filter(r => r.pricePerNight <= filters.maxPrice!);
          }
        }

        return { data: filteredRooms };
      },
      providesTags: ['Room'],
    }),

    getRoomById: builder.query<Room, string>({
      queryFn: async (id) => {
        await simulateApiDelay(200);
        const room = rooms.find(r => r.id === id);
        if (!room) {
          return { error: { status: 404, data: 'Room not found' } };
        }
        return { data: room };
      },
      providesTags: (_result, _error, id) => [{ type: 'Room', id }],
    }),

    createRoom: builder.mutation<Room, RoomFormData>({
      queryFn: async (data) => {
        await simulateApiDelay(500);
        const newRoom: Room = {
          id: String(rooms.length + 1),
          ...data,
          images: [],
        };
        rooms.push(newRoom);
        return { data: newRoom };
      },
      invalidatesTags: ['Room', 'Dashboard'],
    }),

    updateRoom: builder.mutation<Room, { id: string; data: Partial<RoomFormData> }>({
      queryFn: async ({ id, data }) => {
        await simulateApiDelay(500);
        const index = rooms.findIndex(r => r.id === id);
        if (index === -1) {
          return { error: { status: 404, data: 'Room not found' } };
        }
        rooms[index] = { ...rooms[index], ...data };
        return { data: rooms[index] };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Room', id }, 'Dashboard'],
    }),

    updateRoomStatus: builder.mutation<Room, { id: string; status: RoomStatus }>({
      queryFn: async ({ id, status }) => {
        await simulateApiDelay(300);
        const index = rooms.findIndex(r => r.id === id);
        if (index === -1) {
          return { error: { status: 404, data: 'Room not found' } };
        }
        rooms[index] = { ...rooms[index], status };
        return { data: rooms[index] };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Room', id }, 'Dashboard'],
    }),

    deleteRoom: builder.mutation<void, string>({
      queryFn: async (id) => {
        await simulateApiDelay(500);
        const index = rooms.findIndex(r => r.id === id);
        if (index === -1) {
          return { error: { status: 404, data: 'Room not found' } };
        }
        rooms = rooms.filter(r => r.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['Room', 'Dashboard'],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useUpdateRoomStatusMutation,
  useDeleteRoomMutation,
} = roomsApi;
