"use client"

import { useState, useEffect } from 'react'
import { 
  ScheduleHeader, 
  ScheduleForm, 
  CronPreview 
} from '../_sections'
import { DashboardCard } from '@/components/dashboard-card'
import { Skeleton } from '@/components/ui/skeleton'

interface ScheduleSettings {
  is_active: boolean
  frequency: string
  hour: number
  minute: number
  day_of_week?: number
  day_of_month?: number
  timezone: string
  next_scheduled_at?: string
}

export function SchedulePage() {
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScheduleSettings()
  }, [])

  const loadScheduleSettings = async () => {
    try {
      const response = await fetch('/api/newsletter/schedule')
      if (response.ok) {
        const data = await response.json()
        setScheduleSettings(data)
        setIsActive(data.is_active || false)
      }
    } catch (error) {
      console.error('Failed to load schedule settings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
        <div className="space-y-3">
          <ScheduleHeader isActive={isActive} />
          
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardCard variant="default" padding="medium">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                ) : (
                  <ScheduleForm 
                    scheduleSettings={scheduleSettings}
                    isActive={isActive}
                    onActiveChange={setIsActive}
                    onScheduleChange={setScheduleSettings}
                  />
                )}
              </DashboardCard>
            </div>
            
            <div className="lg:col-span-1">
              <DashboardCard variant="default" padding="medium" className="sticky top-6">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : (
                  <CronPreview 
                    scheduleSettings={scheduleSettings}
                    isActive={isActive}
                  />
                )}
              </DashboardCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
