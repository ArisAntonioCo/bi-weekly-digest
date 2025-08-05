export type LogStatus = 'success' | 'failed' | 'pending' | 'running'

export interface LogEntry {
  id: string
  timestamp: string
  status: LogStatus
  trigger: 'scheduled' | 'manual' | 'api'
  recipients: number
  delivered: number
  failed: number
  duration: number // in seconds
  message?: string
  error?: string
  details?: {
    subject?: string
    openRate?: number
    clickRate?: number
    bounceRate?: number
  }
}

export function generateMockLogs(): LogEntry[] {
  const logs: LogEntry[] = []
  const now = new Date()
  
  // Generate logs for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i * 2) // Bi-weekly schedule
    
    // Random chance of different statuses
    const random = Math.random()
    let status: LogStatus = 'success'
    let error: string | undefined
    
    if (random < 0.1) {
      status = 'failed'
      error = ['SMTP connection timeout', 'Rate limit exceeded', 'Invalid API key'][Math.floor(Math.random() * 3)]
    } else if (random < 0.15) {
      status = 'pending'
    } else if (i === 0 && random < 0.3) {
      status = 'running'
    }
    
    const totalRecipients = Math.floor(Math.random() * 500) + 100
    const deliveredCount = status === 'success' 
      ? Math.floor(totalRecipients * (0.95 + Math.random() * 0.05))
      : status === 'failed' ? 0 : Math.floor(totalRecipients * Math.random())
    
    logs.push({
      id: `log-${Date.now()}-${i}`,
      timestamp: date.toISOString(),
      status,
      trigger: i % 7 === 0 ? 'manual' : 'scheduled',
      recipients: totalRecipients,
      delivered: deliveredCount,
      failed: totalRecipients - deliveredCount,
      duration: Math.floor(Math.random() * 300) + 30,
      message: status === 'success' 
        ? `Newsletter sent successfully to ${deliveredCount} recipients`
        : status === 'failed'
        ? `Failed to send newsletter: ${error}`
        : status === 'running'
        ? 'Newsletter send in progress...'
        : 'Newsletter queued for sending',
      error: error,
      details: status === 'success' ? {
        subject: `Bi-Weekly Investment Digest #${30 - i}`,
        openRate: Math.random() * 0.4 + 0.3,
        clickRate: Math.random() * 0.15 + 0.05,
        bounceRate: Math.random() * 0.02
      } : undefined
    })
  }
  
  return logs
}

export function getLogStatusColor(status: LogStatus): string {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-50 dark:bg-green-950/30'
    case 'failed':
      return 'text-red-600 bg-red-50 dark:bg-red-950/30'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30'
    case 'running':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950/30'
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}