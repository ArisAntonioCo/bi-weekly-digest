"use client"

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, TrendingUp, AlertTriangle, ArrowRight, Clock } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Blog } from '@/types/blog'

interface BlogCardProps {
  blog: Blog
}

export function BlogCard({ blog }: BlogCardProps) {
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
    <Card className="group h-full flex flex-col hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="default" className="flex items-center gap-1 text-xs">
            <Icon className="h-3 w-3" />
            {analysisType.type}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {blog.title}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
          {getPreviewText(blog.content)}
        </p>
      </CardContent>
      
      <CardFooter className="pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {format(new Date(blog.created_at), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getReadingTime(blog.content)}
          </div>
        </div>
        
        <Link href={`/blogs/${blog.id}`} className="w-full">
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            Read Full Analysis
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
