import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { NewsletterSchedule } from '@/types/newsletter'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check authentication - allow any authenticated user to view schedule
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the schedule configuration
    const { data: schedule, error } = await supabase
      .from('newsletter_schedule')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Failed to fetch schedule:', error)
      return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
    }

    // If no schedule exists, return default values
    if (!schedule) {
      return NextResponse.json({
        is_active: false,
        frequency: 'weekly',
        hour: 9,
        minute: 0,
        day_of_week: 1,
        day_of_month: 1,
        timezone: 'America/New_York',
        last_sent_at: null,
        next_scheduled_at: null
      })
    }

    return NextResponse.json(schedule)

  } catch (error) {
    console.error('Schedule GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'kyle@zaigo.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      is_active,
      frequency,
      hour,
      minute,
      day_of_week,
      day_of_month,
      timezone
    } = body

    // Validate required fields
    if (frequency === undefined || hour === undefined || minute === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Calculate next scheduled date if schedule is active
    let next_scheduled_at = null
    if (is_active) {
      const now = new Date()
      next_scheduled_at = calculateNextScheduledDate({
        frequency,
        hour,
        minute,
        day_of_week,
        day_of_month
      }, now).toISOString()
    }

    // Check if schedule already exists
    const { data: existingSchedule } = await supabase
      .from('newsletter_schedule')
      .select('id')
      .single()

    let result
    if (existingSchedule) {
      // Update existing schedule
      result = await supabase
        .from('newsletter_schedule')
        .update({
          is_active,
          frequency,
          hour,
          minute,
          day_of_week,
          day_of_month,
          timezone,
          next_scheduled_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSchedule.id)
        .select()
        .single()
    } else {
      // Create new schedule
      result = await supabase
        .from('newsletter_schedule')
        .insert({
          is_active,
          frequency,
          hour,
          minute,
          day_of_week,
          day_of_month,
          timezone,
          next_scheduled_at
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Failed to save schedule:', result.error)
      return NextResponse.json({ 
        error: 'Failed to save schedule' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule saved successfully',
      data: result.data
    })

  } catch (error) {
    console.error('Schedule POST error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function calculateNextScheduledDate(schedule: Pick<NewsletterSchedule, 'frequency' | 'hour' | 'minute' | 'day_of_week' | 'day_of_month'>, from: Date): Date {
  const next = new Date(from)
  
  switch (schedule.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    
    case 'weekly':
      // Find next occurrence of the specified day
      const daysUntilTarget = ((schedule.day_of_week ?? 1) - next.getDay() + 7) % 7 || 7
      next.setDate(next.getDate() + daysUntilTarget)
      break
    
    case 'biweekly':
      // Same as weekly but ensure at least a 14 day window when landing on the same weekday
      const biweeklyTargetDay = schedule.day_of_week ?? 1
      const rawDiff = (biweeklyTargetDay - next.getDay() + 7) % 7
      const daysToAdd = rawDiff === 0 ? 14 : rawDiff
      next.setDate(next.getDate() + daysToAdd)
      break
    
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      next.setDate(schedule.day_of_month ?? 1)
      break
  }
  
  // Set the specific time (default to 9:00 AM if null)
  next.setHours(schedule.hour ?? 9)
  next.setMinutes(schedule.minute ?? 0)
  next.setSeconds(0)
  next.setMilliseconds(0)
  
  // If the calculated time is in the past, add another period
  if (next <= from) {
    return calculateNextScheduledDate(schedule, next)
  }
  
  return next
}
