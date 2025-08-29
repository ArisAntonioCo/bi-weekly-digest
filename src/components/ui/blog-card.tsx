"use client"

import { memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, ChevronRight, Clock } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Blog } from '@/types/blog'
import { 
  extractPreviewText, 
  getAnalysisType, 
  calculateReadingTime, 
  formatReadingTime 
} from '@/utils/blog.utils'
import { SaveToggle } from '@/components/ui/save-toggle'

interface BlogCardProps {
  blog: Blog
  isAdmin?: boolean
}

export const BlogCard = memo(function BlogCard({ blog, isAdmin = false }: BlogCardProps) {
  const router = useRouter()
  
  // Use utility functions for business logic
  const previewText = extractPreviewText(blog.content)
  const analysisType = getAnalysisType(blog.content)
  const readingTime = calculateReadingTime(blog.content)
  const readingTimeText = formatReadingTime(readingTime)
  
  const Icon = analysisType.icon
  const href = isAdmin ? `/admin/blogs/${blog.id}` : `/blogs/${blog.id}`
  
  // Prefetch on hover for faster navigation
  const handleMouseEnter = useCallback(() => {
    router.prefetch(href)
  }, [router, href])

  return (
    <Link href={href} className="block h-full" onMouseEnter={handleMouseEnter}>
      <div className="group h-full flex flex-col bg-muted/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:bg-muted/70 transition-all duration-200 cursor-pointer">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <Badge variant="default" className="flex items-center gap-1 text-xs rounded-full">
              <Icon className="h-3 w-3" />
              {analysisType.type}
            </Badge>
            <SaveToggle blogId={blog.id} />
          </div>
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2 text-foreground group-hover:text-foreground/90 transition-colors">
            {blog.title}
          </h3>
        </div>
        
        {/* Content Preview */}
        <div className="flex-1 mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {previewText}
          </p>
        </div>
        
        {/* Footer */}
        <div className="pt-3 sm:pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {format(new Date(blog.created_at), 'MMM d')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTimeText}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  )
})
