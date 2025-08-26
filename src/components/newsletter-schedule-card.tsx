'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { DashboardCard } from '@/components/dashboard-card'
import { CardHeader, CardContent } from '@/components/dashboard-card'
import { Mail, Check, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewsletterSchedule } from '@/types/newsletter'
import { formatScheduleDisplay, calculateNextScheduledDate } from '@/utils/schedule'
import { Skeleton } from '@/components/ui/skeleton'

interface NewsletterScheduleCardProps {
  subscriptionStatus: boolean | null
  onSubscribe: () => Promise<void>
  onUnsubscribe: () => Promise<void>
  schedule: NewsletterSchedule | null
  loading?: boolean
  error?: string | null
}

export function NewsletterScheduleCard({
  subscriptionStatus,
  onSubscribe,
  onUnsubscribe,
  schedule,
  loading = false,
  error = null
}: NewsletterScheduleCardProps) {
  const [nextIssueDate, setNextIssueDate] = useState<string>('')

  useEffect(() => {
    if (schedule && subscriptionStatus) {
      const nextDate = calculateNextScheduledDate(schedule)
      setNextIssueDate(format(nextDate, 'MMM d'))
    }
  }, [schedule, subscriptionStatus])

  const scheduleDisplay = schedule ? formatScheduleDisplay(schedule) : null

  return (
    <DashboardCard variant="default" padding="medium">
      <CardHeader
        title="Weekly Newsletter"
        subtitle="Investment digest delivered to your inbox"
        icon={<Mail className="h-5 w-5 text-foreground" />}
      />
      <CardContent>
        <div className="space-y-3">
          {/* Status Badge */}
          <div className={cn(
            "p-3 rounded-full text-center",
            subscriptionStatus 
              ? "bg-emerald-500" 
              : "bg-orange-500"
          )}>
            <div className="flex items-center justify-center gap-2">
              {subscriptionStatus ? (
                <>
                  <Check className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">Subscribed</span>
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">Not Subscribed</span>
                </>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2 p-3 rounded-2xl bg-background/50">
            {loading ? (
              <>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </>
            ) : error ? (
              <p className="text-xs text-muted-foreground text-center">
                Unable to load schedule
              </p>
            ) : scheduleDisplay ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Frequency</span>
                  <span className="text-xs font-medium">{scheduleDisplay.frequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Day</span>
                  <span className="text-xs font-medium">{scheduleDisplay.day}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Time</span>
                  <span className="text-xs font-medium">{scheduleDisplay.time}</span>
                </div>
                {subscriptionStatus && schedule?.is_active && (
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Next Issue</span>
                    <span className="text-xs font-medium">{nextIssueDate}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Frequency</span>
                  <span className="text-xs font-medium">Weekly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Day</span>
                  <span className="text-xs font-medium">Sunday</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Time</span>
                  <span className="text-xs font-medium">9:00 AM UTC</span>
                </div>
              </>
            )}
          </div>

          {/* Action Button */}
          {subscriptionStatus ? (
            <Button 
              onClick={onUnsubscribe}
              variant="outline" 
              size="lg"
              className="w-full rounded-full"
            >
              Unsubscribe
            </Button>
          ) : (
            <Button 
              onClick={onSubscribe}
              variant="default"
              size="lg"
              className="w-full rounded-full"
            >
              Subscribe Now
            </Button>
          )}
        </div>
      </CardContent>
    </DashboardCard>
  )
}