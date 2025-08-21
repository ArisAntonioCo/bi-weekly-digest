import useSWR, { mutate } from 'swr'
import { Expert } from '@/types/expert'

interface ExpertsResponse {
  experts: Expert[]
  error?: string
}

const CACHE_KEY = '/api/experts?active=true'
const REVALIDATE_INTERVAL = 5 * 60 * 1000 // 5 minutes

const fetcher = async (url: string): Promise<ExpertsResponse> => {
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = new Error(`Failed to fetch experts`)
    error.cause = response.statusText
    throw error
  }
  
  const data = await response.json()
  return data
}

export function useActiveExperts() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<ExpertsResponse>(
    CACHE_KEY,
    fetcher,
    {
      // Performance optimizations
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: REVALIDATE_INTERVAL,
      
      // Error handling
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      shouldRetryOnError: (error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return true
      },
      
      // Cache configuration
      dedupingInterval: 2000,
      focusThrottleInterval: 5000,
      
      // Optimistic UI
      fallbackData: { experts: [] },
      
      // Keep previous data while revalidating
      keepPreviousData: true,
    }
  )

  const experts = data?.experts || []
  const hasExperts = experts.length > 0

  return {
    experts,
    isLoading,
    isValidating,
    isError: !!error,
    error,
    isEmpty: !isLoading && !hasExperts,
    mutate,
    refresh: () => mutate(),
  }
}

// Preload experts data for faster initial load
export const preloadActiveExperts = () => {
  // This will populate the cache
  void fetcher(CACHE_KEY).catch(() => {
    // Silently fail preloading
  })
}

// Clear the cache manually if needed
export const clearExpertsCache = () => {
  void mutate(CACHE_KEY, undefined, { revalidate: false })
}

// Optimistically update an expert
export const updateExpertOptimistically = async (
  expertId: string,
  updater: (expert: Expert) => Expert
) => {
  await mutate(
    CACHE_KEY,
    async (current) => {
      if (!current) return current
      
      return {
        ...current,
        experts: current.experts.map((expert) =>
          expert.id === expertId ? updater(expert) : expert
        ),
      }
    },
    {
      revalidate: false,
      rollbackOnError: true,
    }
  )
}

// Get a specific expert from cache
export const getCachedExpert = (expertId: string): Expert | undefined => {
  const cache = useSWR.cache.get(CACHE_KEY)
  if (cache?.data?.experts) {
    return cache.data.experts.find((e: Expert) => e.id === expertId)
  }
  return undefined
}