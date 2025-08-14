import { NextRequest } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { NewsletterService } from '@/services/newsletter.service'
import { NewsletterSchedule } from '@/types/newsletter'

export async function GET(request: NextRequest) {
  try {
    console.log('Newsletter cron triggered:', new Date().toISOString())
    
    // Authenticate cron request
    const auth = await NewsletterService.authenticateRequest(request)
    
    if (!auth.isAuthorized) {
      console.log('Unauthorized cron request')
      return NewsletterService.createErrorResponse(
        new Error(auth.error || 'Unauthorized - Missing or invalid CRON_SECRET'),
        401
      )
    }

    const supabase = createServiceClient()
    
    // Get the schedule configuration
    const { data: schedules, error: scheduleError } = await supabase
      .from('newsletter_schedule')
      .select('*')
      .eq('is_active', true)
      .limit(1)

    if (scheduleError) {
      console.log('Error fetching schedule:', scheduleError)
      return NewsletterService.createErrorResponse(
        new Error(`Failed to fetch schedule: ${scheduleError.message}`),
        500
      )
    }

    if (!schedules || schedules.length === 0) {
      console.log('No active schedule found')
      return NewsletterService.createErrorResponse(
        new Error('No active schedule found. Please configure a newsletter schedule in the database'),
        404
      )
    }

    const schedule = schedules[0]

    console.log('Found schedule:', { is_active: schedule.is_active, frequency: schedule.frequency })

    // Check if schedule is active
    if (!schedule.is_active) {
      return NewsletterService.createSuccessResponse('Schedule is not active')
    }

    // Check if we should send newsletter today
    const now = new Date()
    const shouldSend = shouldSendNewsletter(schedule, now)

    if (!shouldSend) {
      return NewsletterService.createSuccessResponse(
        'Not scheduled to send today',
        { nextScheduled: schedule.next_scheduled_at }
      )
    }

    // Get active subscribers
    const subscribers = await NewsletterService.getActiveSubscribers(supabase)
    
    if (subscribers.length === 0) {
      return NewsletterService.createSuccessResponse('No active subscribers found')
    }

    // Generate and send newsletter
    const result = await NewsletterService.generateAndSend(
      subscribers,
      'AI Analysis Report - Weekly Digest',
      {
        supabaseClient: supabase,
        storeNewsletter: true,
        logEvent: true
      }
    )

    if (!result.success) {
      return NewsletterService.createErrorResponse(
        new Error(result.error || 'Failed to send newsletter'),
        500
      )
    }

    // Update schedule
    await supabase
      .from('newsletter_schedule')
      .update({ 
        last_sent_at: now.toISOString(),
        next_scheduled_at: calculateNextScheduledDate(schedule, now).toISOString()
      })
      .eq('id', schedule.id)

    return NewsletterService.createSuccessResponse(
      'Newsletter sent successfully',
      {
        stats: {
          totalSubscribers: subscribers.length,
          successfulSends: result.successCount,
          failedSends: result.failureCount
        }
      }
    )
  } catch (error) {
    // Create service client for error logging
    const supabase = createServiceClient()
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      cron: true
    }, supabase)
    
    return NewsletterService.createErrorResponse(error)
  }
}

function getTimeParts(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  })
  type PartType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'weekday'
  const initial: Record<PartType, string> = {
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    weekday: ''
  }
  const reduced = dtf.formatToParts(date).reduce((acc, p) => {
    if ((['year','month','day','hour','minute','weekday'] as string[]).includes(p.type)) {
      acc[p.type as PartType] = p.value
    }
    return acc
  }, initial)
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return {
    year: Number(reduced.year),
    month: Number(reduced.month),
    day: Number(reduced.day),
    hour: Number(reduced.hour),
    minute: Number(reduced.minute),
    weekday: weekdayMap[reduced.weekday] ?? new Date(date).getDay(),
  }
}

function startOfDayUTCFromParts(year: number, month: number, day: number): Date {
  // Create a UTC date at midnight using the provided calendar day
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

function shouldSendNewsletter(schedule: NewsletterSchedule, now: Date): boolean {
  const tz = schedule.timezone || 'America/New_York'
  const parts = getTimeParts(now, tz)

  // For testing: if hour/minute are null, allow sending every 5 minutes
  if (schedule.hour === null && schedule.minute === null) {
    // Prevent multiple sends within 5 minutes
    if (schedule.last_sent_at) {
      const lastSent = new Date(schedule.last_sent_at)
      const minutesSince = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60))
      if (minutesSince < 5) {
        return false
      }
    }
    return true // Allow sending for testing
  }

  // Gate by local time: only send at the configured local hour/minute
  const targetHour = schedule.hour ?? 9
  const targetMinute = schedule.minute ?? 0
  if (parts.hour !== targetHour || parts.minute !== targetMinute) {
    return false
  }

  // Prevent multiple sends on the same local calendar day
  if (schedule.last_sent_at) {
    const lastParts = getTimeParts(new Date(schedule.last_sent_at), tz)
    const lastDay = startOfDayUTCFromParts(lastParts.year, lastParts.month, lastParts.day)
    const today = startOfDayUTCFromParts(parts.year, parts.month, parts.day)
    if (lastDay.getTime() === today.getTime()) {
      return false
    }
  }

  // Check if today matches the frequency based on local weekday/day
  switch (schedule.frequency) {
    case 'daily':
      return true
    case 'weekly':
      return parts.weekday === (schedule.day_of_week ?? 1) // default Monday
    case 'biweekly':
      if (schedule.last_sent_at) {
        const lastParts = getTimeParts(new Date(schedule.last_sent_at), tz)
        const lastDay = startOfDayUTCFromParts(lastParts.year, lastParts.month, lastParts.day)
        const today = startOfDayUTCFromParts(parts.year, parts.month, parts.day)
        const daysSince = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24))
        return daysSince >= 14 && parts.weekday === (schedule.day_of_week ?? 1)
      }
      return parts.weekday === (schedule.day_of_week ?? 1)
    case 'monthly':
      return parts.day === (schedule.day_of_month ?? 1)
    default:
      return false
  }
}

function calculateNextScheduledDate(schedule: NewsletterSchedule, from: Date): Date {
  const next = new Date(from)
  
  // For testing: if hour/minute are null, schedule for 5 minutes later
  if (schedule.hour === null && schedule.minute === null) {
    next.setMinutes(next.getMinutes() + 5)
    return next
  }
  
  switch (schedule.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
  }
  
  return next
}