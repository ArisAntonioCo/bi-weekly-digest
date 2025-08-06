"use client"

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Save, TestTube, Calendar, Clock, Globe, Loader2, Send } from 'lucide-react'
import { COMMON_TIMEZONES, formatTimeWithTimezone } from '@/utils/timezone'
import { toast } from 'sonner'

interface ScheduleFormProps {
  cronExpression: string
  onCronChange: (expression: string) => void
  isActive: boolean
  onActiveChange: (active: boolean) => void
}

export function ScheduleForm({ 
  onCronChange, 
  isActive, 
  onActiveChange 
}: ScheduleFormProps) {
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('9')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [frequency, setFrequency] = useState('weekly')
  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York')
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTriggering, setIsTriggering] = useState(false)

  useEffect(() => {
    // Load existing schedule settings
    loadScheduleSettings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    updateCronExpression()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency, minute, hour, dayOfWeek, dayOfMonth])

  const loadScheduleSettings = async () => {
    try {
      const response = await fetch('/api/newsletter/schedule')
      if (response.ok) {
        const data = await response.json()
        setMinute(data.minute?.toString() || '0')
        setHour(data.hour?.toString() || '9')
        setDayOfMonth(data.day_of_month?.toString() || '1')
        setDayOfWeek(data.day_of_week?.toString() || '1')
        setFrequency(data.frequency || 'weekly')
        setSelectedTimezone(data.timezone || 'America/New_York')
        onActiveChange(data.is_active || false)
      }
    } catch (error) {
      console.error('Failed to load schedule settings:', error)
      toast.error('Failed to load schedule settings')
    } finally {
      setIsLoading(false)
    }
  }

  const updateCronExpression = () => {
    let expression = ''
    
    switch (frequency) {
      case 'daily':
        expression = `${minute} ${hour} * * *`
        break
      case 'weekly':
        expression = `${minute} ${hour} * * ${dayOfWeek}`
        break
      case 'biweekly':
        expression = `${minute} ${hour} */14 * ${dayOfWeek}`
        break
      case 'monthly':
        expression = `${minute} ${hour} ${dayOfMonth} * *`
        break
      default:
        expression = '0 9 * * 1'
    }
    
    onCronChange(expression)
  }

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
          hour: parseInt(hour),
          minute: parseInt(minute),
          day_of_week: frequency === 'weekly' || frequency === 'biweekly' ? parseInt(dayOfWeek) : null,
          day_of_month: frequency === 'monthly' ? parseInt(dayOfMonth) : null,
          timezone: selectedTimezone,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Schedule saved successfully!')
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

  const handleManualTrigger = async () => {
    setIsTriggering(true)
    try {
      const response = await fetch('/api/newsletter/trigger', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Manual test sent successfully!')
      } else {
        toast.error(data.error || 'Failed to send manual test')
      }
    } catch (error) {
      console.error('Manual trigger error:', error)
      toast.error('Failed to send manual test')
    } finally {
      setIsTriggering(false)
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
        <div className="space-y-2">
          <Label htmlFor="frequency" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            How often should newsletters be sent?
          </Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Every Day</SelectItem>
              <SelectItem value="weekly">Once a Week (Recommended)</SelectItem>
              <SelectItem value="biweekly">Every Two Weeks</SelectItem>
              <SelectItem value="monthly">Once a Month</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {frequency === 'biweekly' && 'Good for less frequent updates and monthly summaries'}
            {frequency === 'weekly' && 'Perfect for consistent engagement without overwhelming subscribers'}
            {frequency === 'daily' && 'Best for time-sensitive content and daily digests'}
            {frequency === 'monthly' && 'Ideal for monthly summaries and less frequent updates'}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            What time should it be sent? (UTC)
          </Label>
          <div className="flex gap-2">
            <div className="space-y-2">
              <Label htmlFor="hour" className="text-xs text-muted-foreground">Hour</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger id="hour" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">12:00 AM (Midnight)</SelectItem>
                  <SelectItem value="1">1:00 AM</SelectItem>
                  <SelectItem value="2">2:00 AM</SelectItem>
                  <SelectItem value="3">3:00 AM</SelectItem>
                  <SelectItem value="4">4:00 AM</SelectItem>
                  <SelectItem value="5">5:00 AM</SelectItem>
                  <SelectItem value="6">6:00 AM</SelectItem>
                  <SelectItem value="7">7:00 AM</SelectItem>
                  <SelectItem value="8">8:00 AM</SelectItem>
                  <SelectItem value="9">9:00 AM (Recommended)</SelectItem>
                  <SelectItem value="10">10:00 AM</SelectItem>
                  <SelectItem value="11">11:00 AM</SelectItem>
                  <SelectItem value="12">12:00 PM (Noon)</SelectItem>
                  <SelectItem value="13">1:00 PM</SelectItem>
                  <SelectItem value="14">2:00 PM</SelectItem>
                  <SelectItem value="15">3:00 PM</SelectItem>
                  <SelectItem value="16">4:00 PM</SelectItem>
                  <SelectItem value="17">5:00 PM</SelectItem>
                  <SelectItem value="18">6:00 PM</SelectItem>
                  <SelectItem value="19">7:00 PM</SelectItem>
                  <SelectItem value="20">8:00 PM</SelectItem>
                  <SelectItem value="21">9:00 PM</SelectItem>
                  <SelectItem value="22">10:00 PM</SelectItem>
                  <SelectItem value="23">11:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minute" className="text-xs text-muted-foreground">Minute</Label>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger id="minute" className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">:00</SelectItem>
                  <SelectItem value="15">:15</SelectItem>
                  <SelectItem value="30">:30</SelectItem>
                  <SelectItem value="45">:45</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Time shown is in UTC. Emails will be sent at this time regardless of subscriber timezone.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Your timezone (for reference only)
          </Label>
          <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select your timezone to see when the newsletter will be sent in your local time.
            The schedule always runs at the UTC time you specified.
          </p>
        </div>

        {(frequency === 'weekly' || frequency === 'biweekly') && (
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Which day of the week?</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger id="dayOfWeek">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Monday (Start of work week)</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday (End of work week)</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
                <SelectItem value="0">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {frequency === 'monthly' && (
          <div className="space-y-2">
            <Label htmlFor="dayOfMonth">Which day of the month?</Label>
            <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
              <SelectTrigger id="dayOfMonth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st (Beginning of month)</SelectItem>
                <SelectItem value="15">15th (Mid-month)</SelectItem>
                <SelectItem value="28">28th (End of month - safe for all months)</SelectItem>
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1
                  if (day === 1 || day === 15 || day === 28) return null
                  return (
                    <SelectItem key={day} value={day.toString()}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                    </SelectItem>
                  )
                }).filter(Boolean)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Note: Choosing days after 28th may skip months with fewer days
            </p>
          </div>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">Production Schedule</p>
            <div className="space-y-1 mt-1">
              <p className="text-sm text-muted-foreground">
                {frequency === 'daily' && `Newsletters will be sent every day at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`}
                {frequency === 'weekly' && `Newsletters will be sent every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(dayOfWeek)]} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`}
                {frequency === 'biweekly' && `Newsletters will be sent every two weeks on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(dayOfWeek)]} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`}
                {frequency === 'monthly' && `Newsletters will be sent on the ${dayOfMonth}${dayOfMonth === '1' ? 'st' : dayOfMonth === '2' ? 'nd' : dayOfMonth === '3' ? 'rd' : 'th'} of each month at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`}
              </p>
              <p className="text-xs text-muted-foreground/80">
                {`(${formatTimeWithTimezone(parseInt(hour), parseInt(minute), selectedTimezone)} in your timezone)`}
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

      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Testing Information</p>
            <div className="space-y-2 mt-2">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Automated Daily Test:</strong> A test email is automatically sent every day at 9:00 AM UTC to:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 ml-4 list-disc">
                <li>kulaizke@gmail.com</li>
                <li>arisantonioco@gmail.com</li>
              </ul>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                This helps verify the newsletter system is working correctly without waiting for the weekly schedule.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="default"
              size="sm"
              onClick={handleManualTrigger}
              disabled={isTriggering || isTesting || isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isTriggering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isTriggering ? 'Sending...' : 'Send Now'}
            </Button>
            <span className="text-xs text-blue-600 dark:text-blue-400 text-center">Manual test</span>
          </div>
        </div>
      </div>
    </div>
  )
}