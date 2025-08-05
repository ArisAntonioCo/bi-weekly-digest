import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'

export interface Timezone {
  label: string
  value: string
  offset: number
}

export const COMMON_TIMEZONES: Timezone[] = [
  { label: "Pacific Time (PST/PDT)", value: "America/Los_Angeles", offset: -8 },
  { label: "Mountain Time (MST/MDT)", value: "America/Denver", offset: -7 },
  { label: "Central Time (CST/CDT)", value: "America/Chicago", offset: -6 },
  { label: "Eastern Time (EST/EDT)", value: "America/New_York", offset: -5 },
  { label: "Atlantic Time (AST/ADT)", value: "America/Halifax", offset: -4 },
  { label: "Brasília Time (BRT)", value: "America/Sao_Paulo", offset: -3 },
  { label: "Greenwich Mean Time (GMT)", value: "Europe/London", offset: 0 },
  { label: "Central European Time (CET)", value: "Europe/Paris", offset: 1 },
  { label: "Eastern European Time (EET)", value: "Europe/Athens", offset: 2 },
  { label: "Moscow Time (MSK)", value: "Europe/Moscow", offset: 3 },
  { label: "Gulf Standard Time (GST)", value: "Asia/Dubai", offset: 4 },
  { label: "India Standard Time (IST)", value: "Asia/Kolkata", offset: 5.5 },
  { label: "China Standard Time (CST)", value: "Asia/Shanghai", offset: 8 },
  { label: "Japan Standard Time (JST)", value: "Asia/Tokyo", offset: 9 },
  { label: "Korea Standard Time (KST)", value: "Asia/Seoul", offset: 9 },
  { label: "Australian Eastern Time (AEST/AEDT)", value: "Australia/Sydney", offset: 10 },
  { label: "New Zealand Time (NZST/NZDT)", value: "Pacific/Auckland", offset: 12 },
]

export function convertUTCToTimezone(
  hour: number,
  minute: number,
  timezone: string
): { time: string; date: Date } {
  const now = new Date()
  const utcDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    hour,
    minute,
    0
  ))
  
  const tzDate = new TZDate(utcDate.getTime(), timezone)
  
  return {
    time: format(tzDate, 'HH:mm'),
    date: tzDate
  }
}

export function getTimezoneAbbreviation(timezone: string): string {
  const now = new Date()
  const tzDate = new TZDate(now.getTime(), timezone)
  const formatted = tzDate.toString()
  const match = formatted.match(/\(([^)]+)\)/)
  if (match) {
    const parts = match[1].split(' ')
    return parts.map(p => p[0]).join('')
  }
  return ''
}

export function formatTimeWithTimezone(
  hour: number,
  minute: number,
  timezone: string
): string {
  const { time } = convertUTCToTimezone(hour, minute, timezone)
  const abbr = getTimezoneAbbreviation(timezone)
  return `${time} ${abbr}`
}

export function getTimezoneDifference(
  utcHour: number,
  utcMinute: number,
  timezone: string
): string {
  const { date: tzDate } = convertUTCToTimezone(utcHour, utcMinute, timezone)
  const utcDate = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
    utcHour,
    utcMinute,
    0
  ))
  
  const isSameDay = tzDate.getDate() === utcDate.getUTCDate()
  const tzHour = tzDate.getHours()
  const tzMinute = tzDate.getMinutes()
  
  if (!isSameDay) {
    const dayDiff = tzDate.getDate() > utcDate.getUTCDate() ? '+1 day' : '-1 day'
    return `${tzHour.toString().padStart(2, '0')}:${tzMinute.toString().padStart(2, '0')} ${dayDiff}`
  }
  
  return `${tzHour.toString().padStart(2, '0')}:${tzMinute.toString().padStart(2, '0')}`
}