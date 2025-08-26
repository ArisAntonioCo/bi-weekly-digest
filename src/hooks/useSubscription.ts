'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface UseSubscriptionReturn {
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
  refresh: () => Promise<void>
}

export function useSubscription(): UseSubscriptionReturn {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/subscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch subscription status')
      }

      const data = await response.json()
      setIsSubscribed(data.isSubscribed || false)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const subscribe = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      setIsSubscribed(true)
      await fetchSubscriptionStatus()
    } catch (err) {
      console.error('Error subscribing:', err)
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unsubscribe')
      }

      setIsSubscribed(false)
      await fetchSubscriptionStatus()
    } catch (err) {
      console.error('Error unsubscribing:', err)
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [fetchSubscriptionStatus])

  return {
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    refresh: fetchSubscriptionStatus
  }
}