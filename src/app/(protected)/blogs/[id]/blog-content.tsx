'use client'

import dynamic from 'next/dynamic'
import { Blog } from '@/types/blog'

const MarkdownRenderer = dynamic(() => import('@/components/ui/markdown-renderer'), {
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
      <div className="h-6 bg-muted rounded w-2/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-4/5"></div>
      </div>
    </div>
  )
})

interface BlogContentProps {
  blog: Blog
}

export function BlogContent({ blog }: BlogContentProps) {
  return (
    <div className="bg-muted/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <div className="max-w-full overflow-x-hidden">
        <MarkdownRenderer content={blog.content} />
      </div>
    </div>
  )
}