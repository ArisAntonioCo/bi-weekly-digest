"use client"

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Save, TestTube, Calendar, Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ScheduleSettings {
  is_active: boolean
  frequency: string
  hour: number
  minute: number
  day_of_week?: number
  day_of_month?: number
  timezone: string
  next_scheduled_at?: string
}

interface ScheduleFormProps {
  scheduleSettings: ScheduleSettings | null
  isActive: boolean
  onActiveChange: (active: boolean) => void
  onScheduleChange: (settings: ScheduleSettings) => void
}

export function ScheduleForm({ 
  scheduleSettings,
  isActive, 
  onActiveChange,
  onScheduleChange
}: ScheduleFormProps) {
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [frequency, setFrequency] = useState('weekly')
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fixed local send time: 9:00 AM America/New_York; cron runs hourly and route gates by local time
  const hour = 9
  const minute = 0

  useEffect(() => {
    if (scheduleSettings) {
      setDayOfMonth(scheduleSettings.day_of_month?.toString() || '1')
      setDayOfWeek(scheduleSettings.day_of_week?.toString() || '1')
      setFrequency(scheduleSettings.frequency || 'weekly')
      setIsLoading(false)
    }
  }, [scheduleSettings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/newsletter/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: isActive,
          frequency,
          hour: hour,
          minute: minute,
          day_of_week: frequency === 'weekly' || frequency === 'biweekly' ? parseInt(dayOfWeek) : null,
          day_of_month: frequency === 'monthly' ? parseInt(dayOfMonth) : null,
          timezone: 'America/New_York',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Schedule saved successfully!')
        // Update parent component with new settings
        onScheduleChange(data)
      } else {
        toast.error(data.error || 'Failed to save schedule')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save schedule')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    try {
      const response = await fetch('/api/newsletter/test', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Test email sent successfully!')
      } else {
        toast.error(data.error || 'Failed to send test email')
      }
    } catch (error) {
      console.error('Test error:', error)
      toast.error('Failed to send test email')
    } finally {
      setIsTesting(false)
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Schedule Settings</h2>
          <p className="text-sm text-muted-foreground">
            Choose when your newsletter should be sent automatically
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="active-toggle" className="text-sm">
            Enable Schedule
          </Label>
          <Switch
            id="active-toggle"
            checked={isActive}
            onCheckedChange={onActiveChange}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="bg-info/10 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-info mt-0.5" />
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-medium text-info">
                Fixed Schedule Time
              </h4>
              <p className="text-xs text-info/80">
                Checks run hourly. Newsletters are sent at 	9:00 AM America/New_York	.
              </p>
              <p className="text-xs text-info/80">
                Your frequency setting below determines on which days the newsletter is actually sent.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Newsletter Frequency
          </Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly (Recommended)</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {frequency === 'daily' && 'Newsletter will be sent every day at 9:00 AM EST'}
            {frequency === 'weekly' && 'Newsletter will be sent every Monday at 9:00 AM EST'}
            {frequency === 'biweekly' && 'Newsletter will be sent every other Monday at 9:00 AM EST'}
            {frequency === 'monthly' && 'Newsletter will be sent on the 1st of each month at 9:00 AM EST'}
          </p>
        </div>

      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">Schedule Summary</p>
            <div className="space-y-1 mt-1">
              <p className="text-sm text-muted-foreground">
                {frequency === 'daily' && 'Newsletter will be sent every day at 9:00 AM EST'}
                {frequency === 'weekly' && 'Newsletter will be sent every Monday at 9:00 AM EST'}
                {frequency === 'biweekly' && 'Newsletter will be sent every other Monday at 9:00 AM EST'}
                {frequency === 'monthly' && 'Newsletter will be sent on the 1st of each month at 9:00 AM EST'}
              </p>
              <p className="text-xs text-muted-foreground/80">
                Status: {isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleTest}
              disabled={isTesting || isSaving}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              {isTesting ? 'Sending...' : 'Test'}
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isTesting}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}