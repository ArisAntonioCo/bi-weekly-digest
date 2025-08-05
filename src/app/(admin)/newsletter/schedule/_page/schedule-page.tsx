"use client"

import { useState } from 'react'
import { 
  ScheduleHeader, 
  ScheduleForm, 
  SchedulePresets, 
  CronPreview 
} from '../_sections'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'

export function SchedulePage() {
  const [cronExpression, setCronExpression] = useState('0 0 * * 1')
  const [isActive, setIsActive] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <ScheduleHeader isActive={isActive} />
        
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>Schedule Information:</strong> All times are in UTC timezone. 
            Your Pro plan supports up to 40 scheduled tasks with unlimited sends. 
            Deploy to production to activate automated newsletter delivery.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <ScheduleForm 
                cronExpression={cronExpression}
                onCronChange={setCronExpression}
                isActive={isActive}
                onActiveChange={setIsActive}
              />
            </Card>
            
            <Card className="p-6">
              <SchedulePresets 
                onSelectPreset={setCronExpression}
                currentExpression={cronExpression}
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