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
        subject: `Weekly Investment Analysis - ${now.toLocaleDateString()}`,
        isTest: false
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

function shouldSendNewsletter(schedule: NewsletterSchedule, now: Date): boolean {
  // Check if we've already sent today
  if (schedule.last_sent_at) {
    const lastSent = new Date(schedule.last_sent_at)
    if (
      lastSent.getDate() === now.getDate() &&
      lastSent.getMonth() === now.getMonth() &&
      lastSent.getFullYear() === now.getFullYear()
    ) {
      return false
    }
  }

  // Check if today matches the schedule
  switch (schedule.frequency) {
    case 'daily':
      return true
    case 'weekly':
      return now.getDay() === (schedule.day_of_week || 1)
    case 'biweekly':
      if (schedule.last_sent_at) {
        const lastSent = new Date(schedule.last_sent_at)
        const daysSinceLastSent = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24))
        return daysSinceLastSent >= 14 && now.getDay() === (schedule.day_of_week || 1)
      }
      return now.getDay() === (schedule.day_of_week || 1)
    case 'monthly':
      return now.getDate() === (schedule.day_of_month || 1)
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