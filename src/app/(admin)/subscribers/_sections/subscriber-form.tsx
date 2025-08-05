"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, AlertCircle, CheckCircle2, Mail } from 'lucide-react'

interface SubscriberFormProps {
  onAddSubscriber: (email: string) => Promise<{ success: boolean; error?: string }>
  adding: boolean
}

interface FormData {
  email: string
}

export function SubscriberForm({ onAddSubscriber, adding }: SubscriberFormProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>()

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email) || 'Please enter a valid email address'
  }

  const onSubmit = async (data: FormData) => {
    setMessage(null)
    
    const result = await onAddSubscriber(data.email.toLowerCase().trim())
    
    if (result.success) {
      setMessage({ type: 'success', text: `Successfully added ${data.email} to subscribers!` })
      reset()
      setTimeout(() => setMessage(null), 5000)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to add subscriber' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New Subscriber
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('email', {
                    required: 'Email address is required',
                    validate: validateEmail
                  })}
                  type="email"
                  placeholder="Enter email address..."
                  className="pl-10 h-11 text-base"
                  disabled={adding}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-2">{errors.email.message}</p>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={adding} 
              className="min-w-[140px] sm:w-auto w-full h-11 text-base font-medium"
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Add Subscriber</span>
                </>
              )}
            </Button>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground">
            Email addresses are automatically validated and duplicates are prevented.
          </div>
        </form>
      </CardContent>
    </Card>
  )
}