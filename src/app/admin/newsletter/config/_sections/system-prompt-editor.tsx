"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardCard, CardHeader, CardContent } from '@/components/dashboard-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Clock, 
  User, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Coins,
  Brain
} from 'lucide-react'
import { format } from 'date-fns'
import { Configuration } from '@/types/configuration'

interface SystemPromptEditorProps {
  config: Configuration | null
  loading: boolean
  saving: boolean
  onSave: (systemPrompt: string) => void
}

interface FormData {
  system_prompt: string
}

export function SystemPromptEditor({ config, loading, saving, onSave }: SystemPromptEditorProps) {
  const [previewMode, setPreviewMode] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty }
  } = useForm<FormData>({
    defaultValues: {
      system_prompt: ''
    }
  })

  const watchedPrompt = watch('system_prompt')

  // Update form when config loads
  useEffect(() => {
    if (config) {
      setValue('system_prompt', config.system_prompt)
      reset({ system_prompt: config.system_prompt })
    }
  }, [config, setValue, reset])

  // Track changes and character count
  useEffect(() => {
    setHasChanges(isDirty)
    setCharacterCount(watchedPrompt?.length || 0)
  }, [isDirty, watchedPrompt])

  const onSubmit = (data: FormData) => {
    onSave(data.system_prompt)
    setHasChanges(false)
  }

  const handleReset = () => {
    if (config) {
      setValue('system_prompt', config.system_prompt)
      reset({ system_prompt: config.system_prompt })
      setHasChanges(false)
    }
  }

  const getPromptTheme = (prompt: string) => {
    const lower = prompt.toLowerCase()
    if (lower.includes('investment') || lower.includes('moic') || lower.includes('stock')) {
      return { theme: 'Investment Analysis', color: 'bg-info', icon: 'TrendingUp' }
    }
    if (lower.includes('crypto') || lower.includes('bitcoin') || lower.includes('blockchain')) {
      return { theme: 'Cryptocurrency', color: 'bg-warning', icon: 'Coins' }
    }
    if (lower.includes('newsletter') || lower.includes('content') || lower.includes('marketing')) {
      return { theme: 'Content Creation', color: 'bg-success', icon: 'FileText' }
    }
    return { theme: 'General AI', color: 'bg-muted', icon: 'Brain' }
  }

  const currentTheme = getPromptTheme(watchedPrompt || config?.system_prompt || '')
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return TrendingUp
      case 'Coins': return Coins
      case 'FileText': return FileText
      case 'Brain': return Brain
      default: return Brain
    }
  }
  
  const ThemeIcon = getIconComponent(currentTheme.icon)

  if (loading) {
    return (
      <div className="space-y-3">
        <DashboardCard variant="default" padding="medium">
          <CardHeader
            title="System Prompt Configuration"
            subtitle="Loading configuration..."
            icon={<FileText className="h-5 w-5 text-foreground" />}
          />
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </CardContent>
        </DashboardCard>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <DashboardCard variant="default" padding="medium">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <CardHeader
            title="System Prompt Configuration"
            subtitle="Define Kyle's AI assistant behavior and expertise domain"
            icon={<FileText className="h-5 w-5 text-foreground" />}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant="outline"
              className={currentTheme.theme === 'Investment Analysis' ? 'border-0 bg-emerald-500 text-white' : ''}
            >
              {currentTheme.theme}
            </Badge>
            {hasChanges && (
              <Badge 
                variant="outline"
                className="border-0 bg-orange-500 text-white animate-pulse"
              >
                Unsaved Changes
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="space-y-3">
          {/* Current Status */}
          {config && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-muted/50 rounded-3xl">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="break-words">Last updated: {format(new Date(config.updated_at), 'PPp')}</span>
              </div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                Kyle&apos;s AI Assistant
              </div>
            </div>
          )}

          {/* Form Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-xs sm:text-sm rounded-full"
              >
                {previewMode ? (
                  <>
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Preview Mode
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>{characterCount.toLocaleString()} characters</span>
              {characterCount > 5000 && (
                <Badge variant="outline" className="text-warning border-warning/20 text-xs">
                  Long prompt
                </Badge>
              )}
            </div>
          </div>

          {/* Prompt Editor */}
          <div className="space-y-2">
            {previewMode ? (
              <div className="min-h-[300px] p-4 border rounded-lg bg-muted/20">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {watchedPrompt || 'No system prompt configured'}
                  </div>
                </div>
              </div>
            ) : (
              <Textarea
                {...register('system_prompt', {
                  required: 'System prompt is required',
                  minLength: {
                    value: 10,
                    message: 'System prompt must be at least 10 characters'
                  }
                })}
                placeholder="Enter the system prompt that defines Kyle&apos;s AI assistant behavior, expertise, and response style..."
                className="min-h-[300px] resize-y font-mono text-sm leading-relaxed rounded-xl"
                disabled={saving}
              />
            )}
            
            {errors.system_prompt && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.system_prompt.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Impact Notice */}
          <Alert>
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Changes to the system prompt will automatically update the AI&apos;s behavior in chat conversations 
              and regenerate blog content to match the new configuration theme.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || saving}
              className="w-full sm:w-auto text-xs sm:text-sm rounded-full"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Reset Changes
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              {!hasChanges && !saving && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                  Configuration saved
                </div>
              )}
              
              <Button
                type="submit"
                disabled={!hasChanges || saving}
                className="w-full sm:w-auto sm:min-w-[120px] text-xs sm:text-sm rounded-full"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </DashboardCard>
    </form>
  )
}