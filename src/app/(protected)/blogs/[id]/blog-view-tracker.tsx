'use client'

import { useEffect } from 'react'
import { useBlogViews } from '@/hooks/use-blog-views'

interface BlogViewTrackerProps {
  blogId: string
}

export function BlogViewTracker({ blogId }: BlogViewTrackerProps) {
  const { markAsViewed } = useBlogViews()

  useEffect(() => {
    // Mark blog as viewed when component mounts
    markAsViewed(blogId)
  }, [blogId, markAsViewed])

  return null
}