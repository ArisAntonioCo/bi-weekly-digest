import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { NewsletterService } from '@/services/newsletter.service'
import { NewsletterSchedule } from '@/types/newsletter'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron job or authorized request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get the schedule configuration
    const { data: schedule, error: scheduleError } = await supabase
      .from('newsletter_schedule')
      .select('*')
      .single()

    if (scheduleError || !schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // Check if schedule is active
    if (!schedule.is_active) {
      return NextResponse.json({ message: 'Schedule is not active' }, { status: 200 })
    }

    // Check if we should send newsletter today
    const now = new Date()
    const shouldSend = shouldSendNewsletter(schedule, now)

    if (!shouldSend) {
      return NextResponse.json({ 
        message: 'Not scheduled to send today',
        nextScheduled: schedule.next_scheduled_at 
      }, { status: 200 })
    }

    // Get active subscribers
    const subscribers = await NewsletterService.getActiveSubscribers()
    
    if (subscribers.length === 0) {
      return NextResponse.json({ 
        message: 'No active subscribers found'
      }, { status: 200 })
    }

    // Generate content
    const config = await NewsletterService.getConfiguration()
    const aiResponse = await NewsletterService.generateContent(config.system_prompt)

    // Send to all subscribers
    const emailPromises = subscribers.map(email => 
      NewsletterService.sendEmail({
        to: email,
        subject: `Weekly Investment Analysis - ${now.toLocaleDateString()}`
      }, aiResponse)
    )

    const results = await Promise.allSettled(emailPromises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failureCount = results.filter(r => r.status === 'rejected').length

    // Update schedule
    await supabase
      .from('newsletter_schedule')
      .update({ 
        last_sent_at: now.toISOString(),
        next_scheduled_at: calculateNextScheduledDate(schedule, now).toISOString()
      })
      .eq('id', schedule.id)

    // Store newsletter
    await NewsletterService.storeNewsletter(aiResponse, `Weekly Investment Analysis - ${now.toLocaleDateString()}`)

    // Log event
    await NewsletterService.logNewsletterEvent('sent', subscribers.length, {
      success: successCount,
      failed: failureCount,
      cron: true
    })

    return NextResponse.json({
      success: true,
      message: 'Newsletter sent successfully',
      stats: {
        totalSubscribers: subscribers.length,
        successfulSends: successCount,
        failedSends: failureCount
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: errorMessage,
      cron: true
    })
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
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
  const parts = Object.fromEntries(dtf.formatToParts(date).map(p => [p.type, p.value])) as any
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: weekdayMap[parts.weekday as string] ?? new Date(date).getDay(),
  }
}

function startOfDayUTCFromParts(year: number, month: number, day: number): Date {
  // Create a UTC date at midnight using the provided calendar day
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

function shouldSendNewsletter(schedule: NewsletterSchedule, now: Date): boolean {
  const tz = schedule.timezone || 'America/New_York'
  const parts = getTimeParts(now, tz)

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