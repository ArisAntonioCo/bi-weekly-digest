"use client"

import { useState } from 'react'
import { 
  ScheduleHeader, 
  ScheduleForm, 
  CronPreview 
} from '../_sections'
import { Card } from '@/components/ui/card'

export function SchedulePage() {
  const [cronExpression, setCronExpression] = useState('0 14 * * *') // 9 AM EST = 14:00 UTC
  const [isActive, setIsActive] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <ScheduleHeader isActive={isActive} />
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <ScheduleForm 
                cronExpression={cronExpression}
                onCronChange={setCronExpression}
                isActive={isActive}
                onActiveChange={setIsActive}
              />
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <CronPreview 
                cronExpression={cronExpression}
                isActive={isActive}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
