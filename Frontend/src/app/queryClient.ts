import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/apiError'

/**
 * React Query owns all server state. Nothing server-owned is mirrored into component state or
 * localStorage, so a refresh re-reads from the API and can only ever show what the database
 * actually holds.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Short but non-zero. Long enough that moving between screens does not refetch the same
       * dashboard twice in a row, short enough that anything the user comes back to is
       * re-read rather than assumed unchanged.
       */
      staleTime: 30_000,
      gcTime: 5 * 60_000,

      /** Coming back to the tab is the moment stale figures are most likely to be noticed. */
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,

      retry: (failureCount, error) => {
        const apiError = ApiError.from(error)
        // Retrying a 403 or a 404 just delays telling the user the truth. Only transient
        // failures are worth a second attempt.
        if (!apiError.isNetworkError && apiError.status >= 400 && apiError.status < 500) {
          return false
        }
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
    mutations: {
      // A failed write is the user's decision to repeat, not ours: retrying a submit
      // automatically risks doing it twice.
      retry: false,
    },
  },
})
