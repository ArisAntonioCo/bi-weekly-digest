"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Expert } from '@/types/expert'
import { toast } from 'sonner'
import { AvatarSelector } from './avatar-selector'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  title: z.string().optional(),
  investing_law: z.string().min(10, 'Investing law must be at least 10 characters').max(500),
  framework_description: z.string().optional(),
  avatar_seed: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface ExpertFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (expert: Expert) => void
  expert?: Expert
}

export function ExpertForm({ open, onClose, onSubmit, expert }: ExpertFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!expert

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      title: '',
      investing_law: '',
      framework_description: '',
      avatar_seed: '',
    },
  })

  useEffect(() => {
    if (expert) {
      form.reset({
        name: expert.name,
        title: expert.title || '',
        investing_law: expert.investing_law,
        framework_description: expert.framework_description || '',
        avatar_seed: expert.avatar_seed || '',
      })
    } else {
      form.reset({
        name: '',
        title: '',
        investing_law: '',
        framework_description: '',
        avatar_seed: '',
      })
    }
  }, [expert, form])

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      const url = isEdit ? `/api/experts/${expert.id}` : '/api/experts'
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save expert')
      }

      const savedExpert = await response.json()
      onSubmit(savedExpert)
      toast.success(isEdit ? 'Expert updated successfully' : 'Expert created successfully')
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save expert')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Expert' : 'Add New Expert'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the expert framework details.' : 'Create a new expert framework for MOIC analysis.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Warren Buffett" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar_seed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <AvatarSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select an avatar for this expert"
                    />
                  </FormControl>
                  <FormDescription>Choose a unique avatar for this expert</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CEO of Berkshire Hathaway" {...field} />
                  </FormControl>
                  <FormDescription>Professional title or position</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="investing_law"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investing Law *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Be fearful when others are greedy and greedy when others are fearful"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Core investing principle or philosophy ({field.value?.length || 0}/500)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="framework_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Framework Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of the investment framework..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Detailed explanation of the investment approach</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEdit ? 'Update Expert' : 'Create Expert'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}