"use client"

import { useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { extractPreviewText } from '@/utils/blog.utils'

import { Blog } from '@/types/blog'

const MarkdownRenderer = dynamic(() => import('./markdown-renderer'), {
  loading: () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
      <div className="h-4 bg-muted rounded w-4/6"></div>
    </div>
  )
})

interface BlogListProps {
  blogs: Blog[]
}

export function BlogList({ blogs }: BlogListProps) {
  const [expandedBlogs, setExpandedBlogs] = useState<Set<string>>(new Set())

  const toggleBlogExpansion = useCallback((blogId: string) => {
    setExpandedBlogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blogId)) {
        newSet.delete(blogId)
      } else {
        newSet.add(blogId)
      }
      return newSet
    })
  }, [])

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Analysis Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Investment analysis will appear here once generated. The content is dynamically 
            created based on the current system prompt configuration.
          </p>
        </div>
      </div>
    )
  }

  const getAnalysisType = (content: string) => {
    if (content.toLowerCase().includes('moic') || content.toLowerCase().includes('multiple on invested capital')) {
      return { type: 'MOIC Analysis', variant: 'default' as const, icon: TrendingUp }
    }
    if (content.toLowerCase().includes('bear case') || content.toLowerCase().includes('risk')) {
      return { type: 'Risk Assessment', variant: 'destructive' as const, icon: AlertTriangle }
    }
    return { type: 'Investment Insight', variant: 'secondary' as const, icon: TrendingUp }
  }

  return (
    <div className="space-y-6">
      {blogs.length > 1 && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest Analysis</h2>
          <Badge variant="outline" className="rounded-full px-3">{blogs.length} Post{blogs.length !== 1 ? 's' : ''}</Badge>
        </div>
      )}
      
      <div className="grid gap-6">
        {blogs.map((blog) => {
          const analysisType = getAnalysisType(blog.content)
          const Icon = analysisType.icon
          const isExpanded = expandedBlogs.has(blog.id) || blogs.length === 1
          const preview = extractPreviewText(blog.content, 500)
          const hasMore = blog.content.length > 500
          
          return (
            <div key={blog.id} className="space-y-4">
              {blogs.length > 1 && (
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-semibold leading-tight">{blog.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(new Date(blog.created_at), 'MMM d, yyyy')}
                      </div>
                      <Separator orientation="vertical" className="h-3" />
                      <Badge variant="default" className="flex items-center gap-1 text-xs rounded-full px-3">
                        <Icon className="h-3 w-3" />
                        {analysisType.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="w-full">
                {isExpanded ? (
                  <MarkdownRenderer content={blog.content} />
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                      {preview}
                      {hasMore && '...'}
                    </p>
                  </div>
                )}
                
                {hasMore && blogs.length > 1 && (
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBlogExpansion(blog.id)}
                      className="text-primary hover:text-primary/80"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Read Full Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
