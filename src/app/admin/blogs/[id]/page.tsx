"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BlogList } from '../_sections'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  CalendarDays, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Share2,
  BookOpen
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

import { Blog } from '@/types/blog'

export default function BlogDetailPage() {
  const params = useParams()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch blog')
        }
        const data = await response.json()
        setBlog(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBlog()
    }
  }, [params.id])

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

  const getReadingTime = (content: string) => {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: `Check out this investment analysis: ${blog.title}`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled share or error occurred
        if ((err as Error).name !== 'AbortError') {
          // Copy to clipboard as fallback
          await navigator.clipboard.writeText(window.location.href)
          toast.success('Link copied to clipboard!')
        }
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">
            {error || 'Blog not found'}
          </h1>
          <p className="text-muted-foreground">
            The blog post you&apos;re looking for could not be loaded.
          </p>
          <Link href="/blogs">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const analysisType = getAnalysisType(blog.content)
  const Icon = analysisType.icon

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/blogs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Analyses
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={analysisType.variant} className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {analysisType.type}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight">{blog.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {format(new Date(blog.created_at), 'MMMM d, yyyy')}
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {getReadingTime(blog.content)}
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Investment Analysis
            </div>
          </div>
        </div>

        <Separator />

        {/* Content - Using existing BlogList component for rendering */}
        <div className="prose prose-lg max-w-none">
          <BlogList blogs={[blog]} />
        </div>
      </div>
    </div>
  )
}