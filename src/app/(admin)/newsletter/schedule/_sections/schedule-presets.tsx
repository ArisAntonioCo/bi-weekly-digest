"use client"

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, CalendarDays, CalendarRange } from 'lucide-react'

interface SchedulePresetsProps {
  onSelectPreset: (expression: string) => void
  currentExpression: string
}

const presets = [
  {
    id: 'daily-morning',
    label: 'Daily Morning',
    description: 'Every day at 9:00 AM UTC',
    expression: '0 9 * * *',
    icon: Clock,
    badge: 'Popular'
  },
  {
    id: 'weekly-monday',
    label: 'Weekly Monday',
    description: 'Every Monday at 8:00 AM UTC',
    expression: '0 8 * * 1',
    icon: Calendar,
    badge: 'Recommended'
  },
  {
    id: 'biweekly-friday',
    label: 'Bi-weekly Friday',
    description: 'Every other Friday at 2:00 PM UTC',
    expression: '0 14 */14 * 5',
    icon: CalendarDays,
    badge: 'Best for newsletters'
  },
  {
    id: 'monthly-first',
    label: 'Monthly First Day',
    description: 'First day of each month at 10:00 AM UTC',
    expression: '0 10 1 * *',
    icon: CalendarRange,
    badge: null
  },
  {
    id: 'weekly-wednesday',
    label: 'Weekly Wednesday',
    description: 'Every Wednesday at 3:00 PM UTC',
    expression: '0 15 * * 3',
    icon: Calendar,
    badge: null
  },
  {
    id: 'daily-evening',
    label: 'Daily Evening',
    description: 'Every day at 6:00 PM UTC',
    expression: '0 18 * * *',
    icon: Clock,
    badge: null
  }
]

export function SchedulePresets({ onSelectPreset, currentExpression }: SchedulePresetsProps) {
  const handlePresetSelect = (expression: string) => {
    onSelectPreset(expression)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Quick Presets</h3>
        <p className="text-sm text-muted-foreground">
          Select a predefined schedule for your newsletter
        </p>
      </div>

      <RadioGroup 
        value={currentExpression} 
        onValueChange={handlePresetSelect}
        className="grid gap-3"
      >
        {presets.map((preset) => {
          const Icon = preset.icon
          return (
            <div 
              key={preset.id}
              className="relative flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handlePresetSelect(preset.expression)}
            >
              <RadioGroupItem 
                value={preset.expression} 
                id={preset.id}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Label 
                    htmlFor={preset.id} 
                    className="font-medium cursor-pointer"
                  >
                    {preset.label}
                  </Label>
                  {preset.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {preset.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {preset.description}
                </p>
              </div>
            </div>
          )
        })}
      </RadioGroup>

      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Choose bi-weekly schedules for consistent newsletter delivery. 
          All times are in UTC and will be converted to your subscribers&apos; local time zones.
        </p>
      </div>
    </div>
  )
}