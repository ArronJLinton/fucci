import {useQuery, useQueryClient} from '@tanstack/react-query';
import {fetchFootballNews} from '../services/newsService';
import type {NewsAPIResponse} from '../types/news';

/**
 * Custom hook for fetching and managing news data
 * Uses React Query for caching and state management
 *
 * @returns Object containing articles, loading state, error, and refresh function
 */
export function useNews() {
  const queryClient = useQueryClient();

  const {data, isLoading, error, refetch, isRefetching} =
    useQuery<NewsAPIResponse>({
      queryKey: ['news', 'football'],
      queryFn: async () => {
        try {
          console.log('[useNews] Fetching football news...');
          const result = await fetchFootballNews();
          console.log('[useNews] Successfully fetched news:', result);
          return result;
        } catch (err) {
          console.error('[useNews] Error fetching news:', err);
          throw err;
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: error => {
        console.error('[useNews] Query error:', error);
      },
    });

  /**
   * Clear the news cache and optionally refetch
   * @param refetchAfterClear - If true, refetches data after clearing cache
   */
  const clearCache = async (refetchAfterClear: boolean = false) => {
    queryClient.removeQueries({queryKey: ['news', 'football']});
    console.log('[useNews] Cleared news cache');
    if (refetchAfterClear) {
      await refetch();
    }
  };

  /**
   * Invalidate the news cache (marks as stale and triggers refetch)
   */
  const invalidateCache = () => {
    queryClient.invalidateQueries({queryKey: ['news', 'football']});
    console.log('[useNews] Invalidated news cache');
  };

  return {
    todayArticles: data?.todayArticles || [],
    historyArticles: data?.historyArticles || [],
    loading: isLoading,
    error: error as Error | null,
    refresh: refetch,
    refreshing: isRefetching,
    cached: data?.cached || false,
    cachedAt: data?.cachedAt,
    clearCache,
    invalidateCache,
  };
}
