'use client'

import { useState, useEffect } from 'react'
import { NewsletterSchedule } from '@/types/newsletter'

interface UseNewsletterScheduleResult {
  schedule: NewsletterSchedule | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useNewsletterSchedule(): UseNewsletterScheduleResult {
  const [schedule, setSchedule] = useState<NewsletterSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/newsletter/schedule')
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedule')
      }
      
      const data = await response.json()
      setSchedule(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching newsletter schedule:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [])

  return {
    schedule,
    loading,
    error,
    refetch: fetchSchedule
  }
}