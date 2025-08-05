"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarCheck, Clock, Globe, Timer } from 'lucide-react'
import { format, addDays, addWeeks, addMonths, setHours, setMinutes, startOfDay } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COMMON_TIMEZONES } from '@/utils/timezone'

interface CronPreviewProps {
  cronExpression: string
  isActive: boolean
}

export function CronPreview({ cronExpression, isActive }: CronPreviewProps) {
  const [nextRuns, setNextRuns] = useState<Date[]>([])
  const [timeUntilNext, setTimeUntilNext] = useState<string>('')
  const [previewTimezone, setPreviewTimezone] = useState('America/New_York')

  useEffect(() => {
    const calculateNextRuns = () => {
      const parts = cronExpression.split(' ')
      if (parts.length !== 5) return []

      const [minute, hour, dayOfMonth, , dayOfWeek] = parts
      const runs: Date[] = []
      const now = new Date()
      
      let baseDate = startOfDay(now)
      
      for (let i = 0; i < 5; i++) {
        let nextRun: Date | null = null
        
        if (dayOfWeek !== '*') {
          const targetDay = parseInt(dayOfWeek)
          let checkDate = baseDate
          
          for (let j = 0; j < 7; j++) {
            if (checkDate.getDay() === targetDay) {
              nextRun = setMinutes(setHours(checkDate, parseInt(hour) || 0), parseInt(minute) || 0)
              if (nextRun <= now && i === 0) {
                checkDate = addDays(checkDate, 7)
                nextRun = setMinutes(setHours(checkDate, parseInt(hour) || 0), parseInt(minute) || 0)
              }
              break
            }
            checkDate = addDays(checkDate, 1)
          }
          
          if (nextRun) {
            runs.push(nextRun)
            baseDate = addWeeks(nextRun, dayOfMonth === '*/14' ? 2 : 1)
          }
        } else if (dayOfMonth !== '*') {
          const targetDayOfMonth = dayOfMonth === '*/14' ? 1 : parseInt(dayOfMonth)
          let checkDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), targetDayOfMonth)
          checkDate = setMinutes(setHours(checkDate, parseInt(hour) || 0), parseInt(minute) || 0)
          
          if (checkDate <= now) {
            checkDate = addMonths(checkDate, 1)
          }
          
          runs.push(checkDate)
          baseDate = addMonths(checkDate, 1)
        } else {
          nextRun = setMinutes(setHours(baseDate, parseInt(hour) || 0), parseInt(minute) || 0)
          if (nextRun <= now) {
            nextRun = addDays(nextRun, 1)
          }
          runs.push(nextRun)
          baseDate = addDays(nextRun, 1)
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
  }, [cronExpression])

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Schedule Preview</h3>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
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
            <SelectTrigger className="w-[200px] h-8 text-xs">
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
              className="flex items-start gap-3 p-3 rounded-lg border bg-background/50"
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

      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> All scheduled times are in UTC. 
          The local times shown are based on your browser&apos;s timezone for reference.
        </p>
      </div>
    </div>
  )
}