"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarCheck, Clock, Globe, Timer } from 'lucide-react'
import { format } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COMMON_TIMEZONES } from '@/utils/timezone'

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

interface CronPreviewProps {
  scheduleSettings: ScheduleSettings | null
  isActive: boolean
}

export function CronPreview({ scheduleSettings, isActive }: CronPreviewProps) {
  const [nextRuns, setNextRuns] = useState<Date[]>([])
  const [timeUntilNext, setTimeUntilNext] = useState<string>('')
  const [previewTimezone, setPreviewTimezone] = useState('America/New_York')

  useEffect(() => {
    const calculateNextRuns = () => {
      if (!scheduleSettings) return []

      const { frequency, hour, minute, day_of_week, day_of_month, timezone } = scheduleSettings
      const runs: Date[] = []
      const now = new Date()
      
      // Create a date in the configured timezone (America/New_York)
      const configuredTimezone = timezone || 'America/New_York'
      let baseDate = new Date()
      
      for (let i = 0; i < 5; i++) {
        let nextRun: Date | null = null
        
        if (frequency === 'daily') {
          // Create date in local timezone
          const tzDate = new TZDate(baseDate.getTime(), configuredTimezone)
          tzDate.setHours(hour || 9, minute || 0, 0, 0)
          nextRun = new Date(tzDate.getTime())
          
          if (nextRun <= now && i === 0) {
            const nextDay = new Date(tzDate.getTime())
            nextDay.setDate(nextDay.getDate() + 1)
            const nextTzDate = new TZDate(nextDay.getTime(), configuredTimezone)
            nextTzDate.setHours(hour || 9, minute || 0, 0, 0)
            nextRun = new Date(nextTzDate.getTime())
          }
          
          runs.push(nextRun)
          baseDate = new Date(nextRun.getTime())
          baseDate.setDate(baseDate.getDate() + 1)
        } 
        else if (frequency === 'weekly' || frequency === 'biweekly') {
          const targetDay = day_of_week ?? 1 // Default to Monday
          const checkDate = new Date(baseDate)
          
          // Find next occurrence of target day
          for (let j = 0; j < 7; j++) {
            if (checkDate.getDay() === targetDay) {
              const tzDate = new TZDate(checkDate.getTime(), configuredTimezone)
              tzDate.setHours(hour || 9, minute || 0, 0, 0)
              nextRun = new Date(tzDate.getTime())
              
              if (nextRun <= now && i === 0) {
                checkDate.setDate(checkDate.getDate() + (frequency === 'biweekly' ? 14 : 7))
                const nextTzDate = new TZDate(checkDate.getTime(), configuredTimezone)
                nextTzDate.setHours(hour || 9, minute || 0, 0, 0)
                nextRun = new Date(nextTzDate.getTime())
              }
              break
            }
            checkDate.setDate(checkDate.getDate() + 1)
          }
          
          if (nextRun) {
            runs.push(nextRun)
            baseDate = new Date(nextRun.getTime())
            baseDate.setDate(baseDate.getDate() + (frequency === 'biweekly' ? 14 : 7))
          }
        } 
        else if (frequency === 'monthly') {
          const targetDayOfMonth = day_of_month ?? 1
          const checkDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), targetDayOfMonth)
          const tzDate = new TZDate(checkDate.getTime(), configuredTimezone)
          tzDate.setHours(hour || 9, minute || 0, 0, 0)
          nextRun = new Date(tzDate.getTime())
          
          if (nextRun <= now && i === 0) {
            checkDate.setMonth(checkDate.getMonth() + 1)
            const nextTzDate = new TZDate(checkDate.getTime(), configuredTimezone)
            nextTzDate.setHours(hour || 9, minute || 0, 0, 0)
            nextRun = new Date(nextTzDate.getTime())
          }
          
          runs.push(nextRun)
          baseDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, targetDayOfMonth)
        }
      }
      
      return runs
    }

    const runs = calculateNextRuns()
    setNextRuns(runs)

    if (runs.length > 0) {
      const updateTimeUntil = () => {
        const now = new Date()
        const next = runs[0]
        const diff = next.getTime() - now.getTime()
        
        if (diff <= 0) {
          setTimeUntilNext('Running now...')
          return
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        let timeStr = ''
        if (days > 0) timeStr += `${days}d `
        if (hours > 0) timeStr += `${hours}h `
        timeStr += `${minutes}m`
        
        setTimeUntilNext(timeStr)
      }
      
      updateTimeUntil()
      const interval = setInterval(updateTimeUntil, 60000)
      
      return () => clearInterval(interval)
    }
  }, [scheduleSettings])

  const formatLocalTime = (date: Date, timezone: string) => {
    const tzDate = new TZDate(date.getTime(), timezone)
    return format(tzDate, 'MMM dd, yyyy HH:mm')
  }

  
  const getTimezoneAbbr = (timezone: string) => {
    const tzDate = new TZDate(new Date().getTime(), timezone)
    const formatted = tzDate.toString()
    const match = formatted.match(/\(([^)]+)\)/)
    if (match) {
      const parts = match[1].split(' ')
      return parts.map(p => p[0]).join('')
    }
    return ''
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Schedule Preview</h3>
        <Badge 
          variant="outline"
          className={isActive 
            ? "border-0 bg-emerald-500 text-white" 
            : "border-0 bg-orange-500 text-white"}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="bg-muted/50 rounded-3xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Next Run</span>
        </div>
        {nextRuns.length > 0 ? (
          <>
            <div className="text-2xl font-bold">{timeUntilNext}</div>
            <p className="text-sm text-muted-foreground">
              {format(nextRuns[0], 'MMM dd, yyyy HH:mm')} UTC
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No scheduled runs</p>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Upcoming Runs</span>
          </div>
          <Select value={previewTimezone} onValueChange={setPreviewTimezone}>
            <SelectTrigger className="w-[200px] h-8 text-xs rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          {nextRuns.map((run, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-3xl border border-border/50 bg-background/50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">
                    {format(run, 'MMM dd, yyyy HH:mm')} UTC
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatLocalTime(run, previewTimezone)} {getTimezoneAbbr(previewTimezone)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-3xl p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Newsletter checks run hourly. The schedule above shows when newsletters will actually be sent based on your frequency settings and local time ({scheduleSettings?.timezone || 'America/New_York'}).
        </p>
      </div>
    </div>
  )
}