"use client"

import { Badge } from '@/components/ui/badge'
import { Clock, Zap, Globe, Layers } from 'lucide-react'

interface ScheduleHeaderProps {
  isActive: boolean
}

export function ScheduleHeader({ isActive }: ScheduleHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge 
          variant={isActive ? "default" : "secondary"} 
          className="flex items-center gap-1"
        >
          <Clock className="h-3 w-3" />
          Schedule {isActive ? "Active" : "Inactive"}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Pro Plan
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          UTC Only
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Layers className="h-3 w-3" />
          40 Crons
        </Badge>
      </div>
    </div>
  )
}