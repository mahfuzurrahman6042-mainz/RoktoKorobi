import { QueryClient, useQuery, keepPreviousData }
  from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const VALID_BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,      // FIX NEW-004: was cacheTime (removed in v5)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
      structuralSharing: true,
    },
    mutations: { retry: 2, retryDelay: 1000 },
  },
});

export function useDonors(filters?: {
  bloodGroup?: string;
  location?: string;
  limit?: number;
}) {
  if (filters?.bloodGroup &&
      !VALID_BLOOD_GROUPS.includes(filters.bloodGroup)) {
    throw new Error(`Invalid blood group: ${filters.bloodGroup}`);
  }
  return useQuery({
    queryKey: ['donors', filters?.bloodGroup,
               filters?.location, filters?.limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_donors_with_eligibility', {
          filter_blood_group: filters?.bloodGroup ?? null,
          filter_location:    filters?.location ?? null,
          result_limit:       filters?.limit ?? 50,
        });
      if (error) throw error;
      return { donors: data ?? [], count: data?.length ?? 0 };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,            // FIX NEW-004: was cacheTime
    placeholderData: keepPreviousData, // FIX NEW-003: was keepPreviousData: true
    structuralSharing: true,
  });
}

export function useUserProfile(userId: string | undefined) { // FIX NEW-002: ASCII |
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles').select('*')
        .eq('id', userId).single();
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,           // FIX NEW-004: was cacheTime
    enabled: !!userId,
    structuralSharing: true,
  });
}
