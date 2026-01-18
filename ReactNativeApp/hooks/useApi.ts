import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

/**
 * Generic hook for API queries
 */
export const useApi = <T = any>(
  key: string[],
  fetcher: () => Promise<{ data: T }>,
  options?: any
) => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await fetcher();
      return response.data;
    },
    ...options,
  });
};

/**
 * Generic hook for API mutations
 */
export const useApiMutation = <TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData }>,
  options?: any
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await mutationFn(variables);
      return response.data;
    },
    onSuccess: () => {
      // Optionally invalidate queries
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key: string[]) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
    ...options,
  });
};

/**
 * Hook for dashboard stats
 */
export const useDashboardStats = () => {
  return useApi(['dashboard', 'stats'], () => apiClient.dashboard.stats(), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for recent activity
 */
export const useRecentActivity = (limit: number = 10) => {
  return useApi(
    ['dashboard', 'activity', limit],
    () => apiClient.dashboard.recentActivity({ limit }),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};
