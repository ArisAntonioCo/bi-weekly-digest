"use client"

import { useState, useEffect } from 'react'
import { BlogCard } from './blog-card'
import { BlogPagination } from './blog-pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Clock, Calendar } from 'lucide-react'

interface Blog {
  id: string
  title: string
  content: string
  created_at: string
}

interface BlogsGridProps {
  blogs: Blog[]
  currentPage: number
  totalPages: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
  onSortChange: (sort: 'latest' | 'oldest') => void
  currentSort: 'latest' | 'oldest'
}

export function BlogsGrid({ 
  blogs, 
  currentPage,
  totalPages,
  total,
  perPage,
  onPageChange,
  onSortChange,
  currentSort
}: BlogsGridProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'oldest'>(currentSort)

  useEffect(() => {
    setActiveTab(currentSort)
  }, [currentSort])

  const handleTabChange = (value: string) => {
    const newSort = value as 'latest' | 'oldest'
    setActiveTab(newSort)
    onSortChange(newSort)
    onPageChange(1) // Reset to first page when changing sort
  }

  if (blogs.length === 0 && total === 0) {
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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-[300px] grid-cols-2">
            <TabsTrigger value="latest" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Latest
            </TabsTrigger>
            <TabsTrigger value="oldest" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Oldest
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'Analysis' : 'Analyses'} Available
          </div>
        </div>

        <TabsContent value="latest" className="mt-0 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
          
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            perPage={perPage}
            onPageChange={onPageChange}
          />
        </TabsContent>

        <TabsContent value="oldest" className="mt-0 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
          
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            perPage={perPage}
            onPageChange={onPageChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}