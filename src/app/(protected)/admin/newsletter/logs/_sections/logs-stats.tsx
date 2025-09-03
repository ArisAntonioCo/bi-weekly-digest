"use client"

import { Card } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { type LogEntry } from '../_utils/mock-data'

interface LogsStatsProps {
  logs: LogEntry[]
}

export function LogsStats({ logs }: LogsStatsProps) {
  const stats = {
    total: logs.length,
    successful: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    pending: logs.filter(l => l.status === 'pending' || l.status === 'running').length,
    totalRecipients: logs.reduce((sum, l) => sum + l.recipients, 0),
    totalDelivered: logs.reduce((sum, l) => sum + l.delivered, 0),
    successRate: 0,
    avgDuration: 0
  }

  stats.successRate = stats.total > 0 
    ? (stats.successful / stats.total) * 100 
    : 0

  const successfulLogs = logs.filter(l => l.status === 'success')
  stats.avgDuration = successfulLogs.length > 0
    ? successfulLogs.reduce((sum, l) => sum + l.duration, 0) / successfulLogs.length
    : 0

  const statCards = [
    {
      label: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Successful',
      value: stats.successful,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Total Recipients',
      value: stats.totalRecipients.toLocaleString(),
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      label: 'Avg Duration',
      value: `${Math.round(stats.avgDuration)}s`,
      icon: AlertCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}