import { api } from '@/app/api';
import type { Payment } from '@/types/payment';
import { getPaymentsData } from '@/features/bookings/bookingsApi';
import { simulateApiDelay } from '@/utils/helpers';

export const paymentsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPayments: builder.query<Payment[], void>({
            queryFn: async () => {
                await simulateApiDelay(200);
                const payments = getPaymentsData();
                return {
                    data: [...payments].sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    ),
                };
            },
            providesTags: ['Dashboard'], // re-fetches when Dashboard tag invalidated (i.e. on check-in)
        }),
    }),
});

export const { useGetPaymentsQuery } = paymentsApi;
