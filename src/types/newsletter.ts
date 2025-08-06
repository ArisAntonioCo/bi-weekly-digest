export interface NewsletterSchedule {
  id?: string
  is_active: boolean
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  hour: number
  minute: number
  day_of_week?: number | null
  day_of_month?: number | null
  timezone: string
  last_sent_at?: string | null
  next_scheduled_at?: string | null
  updated_at?: string
}

export type LogStatus = 'success' | 'failed' | 'pending' | 'running'

export interface LogEntry {
  id: string
  timestamp: string
  status: LogStatus
  trigger: 'scheduled' | 'manual' | 'api'
  recipients: number
  delivered: number
  failed: number
  duration: number
  message?: string
  error?: string
  details?: {
    subject?: string
    openRate?: number
    clickRate?: number
    bounceRate?: number
  }
}