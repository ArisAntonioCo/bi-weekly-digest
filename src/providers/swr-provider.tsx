"use client"

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

const swrConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  keepPreviousData: true,
  fetcher: async (url: string) => {
    const response = await fetch(url)
    
    if (!response.ok) {
      const error = new Error('An error occurred while fetching the data.')
      throw error
    }
    
    return response.json()
  },
  onError: (error: Error, key: string) => {
    if (error.message?.includes('Failed to fetch')) {
      console.error(`Network error for ${key}:`, error)
    }
  },
  onSuccess: (data: unknown, key: string) => {
    console.debug(`Successfully fetched ${key}`)
  },
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  )
}