"use client"

import { useState, useEffect } from 'react'
import { BlogList, BlogHeader } from '../_sections'
import { Skeleton } from '@/components/ui/skeleton'

interface Blog {
  id: string
  title: string
  content: string
  created_at: string
}

export function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [systemPromptSummary, setSystemPromptSummary] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs')
        if (!response.ok) {
          throw new Error('Failed to fetch blogs')
        }
        const data = await response.json()
        setBlogs(data.blogs || [])
        setSystemPromptSummary(data.systemPromptSummary || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Error Loading Blogs</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <BlogHeader systemPromptSummary={systemPromptSummary} />
        <BlogList blogs={blogs} />
      </div>
    </div>
  )
}