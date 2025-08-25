'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

interface UseBlogViewsResult {
  viewedBlogIds: string[]
  markAsViewed: (blogId: string) => Promise<void>
  isLoading: boolean
}

const STORAGE_KEY = 'viewed_blogs'

export function useBlogViews(): UseBlogViewsResult {
  const [viewedBlogIds, setViewedBlogIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const loadViewedBlogs = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Load from database for authenticated users
        const { data, error } = await supabase
          .from('blog_views')
          .select('blog_id')
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Error loading viewed blogs:', error)
          // Fallback to localStorage
          loadFromLocalStorage()
        } else {
          const ids = data.map(item => item.blog_id)
          setViewedBlogIds(ids)
          // Also sync to localStorage for consistency
          localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
        }
      } else {
        // Load from localStorage for unauthenticated users
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error('Error in loadViewedBlogs:', error)
      loadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadViewedBlogs()
  }, [loadViewedBlogs])

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const ids = JSON.parse(stored)
        if (Array.isArray(ids)) {
          setViewedBlogIds(ids)
        }
      } catch (error) {
        console.error('Error parsing localStorage:', error)
        setViewedBlogIds([])
      }
    }
  }

  const markAsViewed = async (blogId: string) => {
    // Skip if already viewed
    if (viewedBlogIds.includes(blogId)) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Save to database for authenticated users
        const { error } = await supabase
          .from('blog_views')
          .upsert({
            user_id: user.id,
            blog_id: blogId,
            viewed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,blog_id'
          })
        
        if (error) {
          console.error('Error marking blog as viewed:', error)
          // Fallback to localStorage
          saveToLocalStorage(blogId)
        } else {
          // Update state
          setViewedBlogIds(prev => [...prev, blogId])
          // Sync to localStorage
          const updated = [...viewedBlogIds, blogId]
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        }
      } else {
        // Save to localStorage for unauthenticated users
        saveToLocalStorage(blogId)
      }
    } catch (error) {
      console.error('Error in markAsViewed:', error)
      saveToLocalStorage(blogId)
    }
  }

  const saveToLocalStorage = (blogId: string) => {
    const updated = [...viewedBlogIds, blogId]
    setViewedBlogIds(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return {
    viewedBlogIds,
    markAsViewed,
    isLoading
  }
}