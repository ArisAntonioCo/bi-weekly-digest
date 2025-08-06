"use client"

import { useState, useEffect, useCallback } from 'react'
import { BlogsGrid, BlogHeader } from '../_sections'
import { Skeleton } from '@/components/ui/skeleton'
import { Paginated } from '@/types/pagination'
import { Blog } from '@/types/blog'

export function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [systemPromptSummary, setSystemPromptSummary] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest')

  const fetchBlogs = useCallback(async (page: number, sortOrder: 'latest' | 'oldest') => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        sort: sortOrder
      })
      
      const response = await fetch(`/api/blogs?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }
      
      const data: Paginated<Blog> & { systemPromptSummary?: string } = await response.json()
      
      setBlogs(data.data || [])
      setSystemPromptSummary(data.systemPromptSummary || '')
      setCurrentPage(data.currentPage || 1)
      setTotalPages(data.lastPage || 1)
      setTotal(data.total || 0)
      setPerPage(data.perPage || 10)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [perPage])

  useEffect(() => {
    fetchBlogs(currentPage, sort)
  }, [currentPage, sort, fetchBlogs])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (newSort: 'latest' | 'oldest') => {
    setSort(newSort)
    setCurrentPage(1) // Reset to first page when changing sort
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Error Loading Blogs</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <BlogHeader systemPromptSummary={systemPromptSummary} />
        <BlogsGrid 
          blogs={blogs}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          currentSort={sort}
        />
      </div>
    </div>
  )
}