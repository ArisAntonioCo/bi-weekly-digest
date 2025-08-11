"use client"

import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, TrendingUp, AlertTriangle, ChevronRight, Clock } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Blog } from '@/types/blog'

interface BlogCardProps {
  blog: Blog
}

export const BlogCard = memo(function BlogCard({ blog }: BlogCardProps) {
  // Extract preview text (first 200 characters of content)
  const getPreviewText = (content: string) => {
    // Remove markdown formatting for preview
    const plainText = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/\n{2,}/g, ' ') // Replace multiple newlines
      .replace(/\n/g, ' ') // Replace single newlines
      .trim()
    
    return plainText.length > 200 
      ? plainText.substring(0, 200) + '...' 
      : plainText
  }

  // Determine analysis type based on content
  const getAnalysisType = (content: string) => {
    const contentLower = content.toLowerCase()
    if (contentLower.includes('moic') || contentLower.includes('multiple on invested capital')) {
      return { type: 'MOIC Analysis', variant: 'default' as const, icon: TrendingUp }
    }
    if (contentLower.includes('bear case') || contentLower.includes('risk')) {
      return { type: 'Risk Assessment', variant: 'destructive' as const, icon: AlertTriangle }
    }
    return { type: 'Investment Insight', variant: 'secondary' as const, icon: TrendingUp }
  }

  // Calculate reading time (rough estimate: 200 words per minute)
  const getReadingTime = (content: string) => {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  const analysisType = getAnalysisType(blog.content)
  const Icon = analysisType.icon

  return (
    <Link href={`/blogs/${blog.id}`} className="block h-full">
      <div className="group h-full flex flex-col bg-muted/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:bg-muted/70 transition-all duration-200 cursor-pointer">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <Badge variant={analysisType.variant} className="flex items-center gap-1 text-xs rounded-full">
              <Icon className="h-3 w-3" />
              {analysisType.type}
            </Badge>
          </div>
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2 text-foreground group-hover:text-foreground/90 transition-colors">
            {blog.title}
          </h3>
        </div>
        
        {/* Content Preview */}
        <div className="flex-1 mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {getPreviewText(blog.content)}
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
                {getReadingTime(blog.content)}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  )
})