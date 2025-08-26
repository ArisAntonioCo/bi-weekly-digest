"use client"

import { Badge } from '@/components/ui/badge'

interface ScheduleHeaderProps {
  isActive: boolean
}

export function ScheduleHeader({ isActive }: ScheduleHeaderProps) {
  return (
    <div className="mb-3">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Newsletter Schedule</h1>
      <p className="text-muted-foreground mt-1">Automate your weekly newsletter delivery</p>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Badge 
          variant="outline"
          className={isActive 
            ? "border-0 bg-emerald-500 text-white" 
            : "border-0 bg-orange-500 text-white"}
        >
          {isActive ? "Schedule Active" : "Schedule Inactive"}
        </Badge>
        <Badge variant="outline">
          Pro Plan
        </Badge>
        <Badge variant="outline">
          UTC Timezone
        </Badge>
        <Badge variant="outline">
          40 Crons Available
        </Badge>
      </div>
    </div>
  )
}