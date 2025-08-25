import { format } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { NewsletterSchedule } from '@/types/newsletter'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Format the schedule display based on frequency and settings
 */
export function formatScheduleDisplay(schedule: NewsletterSchedule): {
  frequency: string
  day: string
  time: string
} {
  const hour = schedule.hour ?? 9
  const minute = schedule.minute ?? 0
  
  // Format time in 12-hour format
  const timeStr = format(new Date(2024, 0, 1, hour, minute), 'h:mm a')
  
  // Get timezone abbreviation
  const tzAbbr = getTimezoneAbbreviation(schedule.timezone)
  const time = `${timeStr} ${tzAbbr}`
  
  switch (schedule.frequency) {
    case 'daily':
      return {
        frequency: 'Daily',
        day: 'Every day',
        time
      }
    
    case 'weekly':
      return {
        frequency: 'Weekly',
        day: DAYS_OF_WEEK[schedule.day_of_week ?? 0],
        time
      }
    
    case 'biweekly':
      return {
        frequency: 'Bi-weekly',
        day: `Every other ${DAYS_OF_WEEK[schedule.day_of_week ?? 0]}`,
        time
      }
    
    case 'monthly':
      const dayOfMonth = schedule.day_of_month ?? 1
      const daySuffix = getDaySuffix(dayOfMonth)
      return {
        frequency: 'Monthly',
        day: `${dayOfMonth}${daySuffix} of each month`,
        time
      }
    
    default:
      return {
        frequency: 'Weekly',
        day: 'Sunday',
        time: '9:00 AM UTC'
      }
  }
}

/**
 * Calculate the next scheduled date based on the schedule settings
 */
export function calculateNextScheduledDate(schedule: NewsletterSchedule): Date {
  const now = new Date()
  const { frequency, hour, minute, day_of_week, day_of_month, timezone } = schedule
  
  // Create a date in the configured timezone
  const tzNow = new TZDate(now.getTime(), timezone)
  let nextRun: Date
  
  switch (frequency) {
    case 'daily':
      nextRun = new Date(tzNow)
      nextRun.setHours(hour ?? 9, minute ?? 0, 0, 0)
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      break
    
    case 'weekly':
    case 'biweekly':
      const targetDay = day_of_week ?? 0
      nextRun = new Date(tzNow)
      nextRun.setHours(hour ?? 9, minute ?? 0, 0, 0)
      
      // Find next occurrence of target day
      const daysUntilTarget = (targetDay - nextRun.getDay() + 7) % 7
      if (daysUntilTarget === 0 && nextRun <= now) {
        // If it's today but time has passed, go to next week
        nextRun.setDate(nextRun.getDate() + (frequency === 'biweekly' ? 14 : 7))
      } else if (daysUntilTarget > 0) {
        nextRun.setDate(nextRun.getDate() + daysUntilTarget)
      }
      break
    
    case 'monthly':
      const targetDayOfMonth = day_of_month ?? 1
      nextRun = new Date(tzNow.getFullYear(), tzNow.getMonth(), targetDayOfMonth)
      nextRun.setHours(hour ?? 9, minute ?? 0, 0, 0)
      
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
      break
    
    default:
      // Default to next Sunday at 9 AM
      nextRun = new Date(tzNow)
      nextRun.setHours(9, 0, 0, 0)
      const daysUntilSunday = (0 - nextRun.getDay() + 7) % 7
      if (daysUntilSunday === 0 && nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7)
      } else if (daysUntilSunday > 0) {
        nextRun.setDate(nextRun.getDate() + daysUntilSunday)
      }
  }
  
  return nextRun
}

/**
 * Get timezone abbreviation from timezone string
 */
function getTimezoneAbbreviation(timezone: string): string {
  try {
    const tzDate = new TZDate(new Date().getTime(), timezone)
    const formatted = tzDate.toString()
    const match = formatted.match(/\(([^)]+)\)/)
    if (match) {
      // Extract abbreviation from the timezone string
      const parts = match[1].split(' ')
      if (parts.length === 1) {
        return parts[0]
      }
      return parts.map(p => p[0]).join('')
    }
  } catch (error) {
    console.error('Error getting timezone abbreviation:', error)
  }
  return 'UTC'
}

/**
 * Get ordinal suffix for day of month (1st, 2nd, 3rd, etc.)
 */
function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th'
  }
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}