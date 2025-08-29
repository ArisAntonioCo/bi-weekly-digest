"use client"

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Toggle } from '@/components/ui/toggle'

interface SaveToggleProps {
  blogId: string
  className?: string
}

export function SaveToggle({ blogId, className }: SaveToggleProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState<boolean>(false)
  const [authed, setAuthed] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      setAuthed(!!user)
      if (!user) return
      const { data } = await supabase
        .from('saved_blogs')
        .select('id')
        .eq('blog_id', blogId)
        .maybeSingle()
      if (!mounted) return
      setSaved(!!data)
    }
    init()
    return () => { mounted = false }
  }, [blogId, supabase])

  const handleToggle = useCallback(async (next: boolean) => {
    if (!authed) {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      if (saved && next === false) {
        const { error } = await supabase
          .from('saved_blogs')
          .delete()
          .eq('blog_id', blogId)
        if (error) throw error
        setSaved(false)
        toast.success('Removed from saved')
      } else if (!saved && next === true) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        const { error } = await supabase
          .from('saved_blogs')
          .insert({ user_id: user.id, blog_id: blogId })
        if (error) throw error
        setSaved(true)
        toast.success('Saved')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update saved state'
      toast.error('Action failed', { description: message })
    } finally {
      setLoading(false)
    }
  }, [authed, blogId, router, saved, supabase])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            className="inline-flex"
          >
            <Toggle
              pressed={saved}
              onPressedChange={handleToggle}
              aria-label={saved ? 'Unsave' : 'Save'}
              disabled={loading}
              size="lg"
              className={
                className || [
                  // Transparent background at all times
                  'hover:bg-transparent data-[state=on]:bg-transparent',
                  // Color only
                  'text-muted-foreground hover:text-foreground data-[state=on]:text-brand',
                  // Icon-only spacing and much larger hit area
                  'px-0 min-w-12 h-12 leading-none'
                ].join(' ')
              }
            >
              <Bookmark className={saved ? 'h-6 w-6 text-brand fill-brand' : 'h-6 w-6'} />
            </Toggle>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{saved ? 'Saved' : 'Save'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
