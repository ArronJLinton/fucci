import {QueryClient} from '@tanstack/react-query';

/**
 * React Query client configuration for news feed caching
 * 
 * Cache Strategy:
 * - staleTime: 5 minutes - Data is considered fresh for 5 minutes
 * - cacheTime: 15 minutes - Cached data is kept for 15 minutes (matches backend Redis TTL)
 * - retry: 3 attempts with exponential backoff
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

