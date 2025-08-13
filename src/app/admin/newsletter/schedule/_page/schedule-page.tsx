"use client"

import { useState, useEffect } from 'react'
import { 
  ScheduleHeader, 
  ScheduleForm, 
  CronPreview 
} from '../_sections'
import { Card } from '@/components/ui/card'
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <ScheduleHeader isActive={isActive} />
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-6">
              {loading ? (
                <div className="space-y-4">
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
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <CronPreview 
                  scheduleSettings={scheduleSettings}
                  isActive={isActive}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
