"use client"

import { useState, useEffect, memo, useCallback } from 'react'
import { BlogPagination } from './blog-pagination'
import { BlogCardObserver } from './blog-card-observer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Clock, Calendar, Search } from 'lucide-react'
import { Blog } from '@/types/blog'
import { BlogSearch } from './blog-search'
import { BlogFilters } from './blog-filters'
import { cn } from '@/lib/utils'

interface BlogGridProps {
  blogs: Blog[]
  currentPage: number
  totalPages: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
  onSortChange: (sort: 'latest' | 'oldest') => void
  onSearchChange?: (search: string) => void
  onFilterChange?: (filters: BlogFilterOptions) => void
  currentSort: 'latest' | 'oldest'
  searchQuery?: string
  filters?: BlogFilterOptions
  isAdmin?: boolean
  showSearch?: boolean
  showFilters?: boolean
  className?: string
}

export interface BlogFilterOptions {
  type?: 'all' | 'moic' | 'risk' | 'insight'
  dateRange?: {
    from?: Date
    to?: Date
  }
}

export const BlogGrid = memo(function BlogGrid({ 
  blogs, 
  currentPage,
  totalPages,
  total,
  perPage,
  onPageChange,
  onSortChange,
  onSearchChange,
  onFilterChange,
  currentSort,
  searchQuery = '',
  filters,
  isAdmin = false,
  showSearch = true,
  showFilters = true,
  className
}: BlogGridProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'oldest'>(currentSort)

  useEffect(() => {
    setActiveTab(currentSort)
  }, [currentSort])

  const handleTabChange = useCallback((value: string) => {
    const newSort = value as 'latest' | 'oldest'
    setActiveTab(newSort)
    onSortChange(newSort)
    onPageChange(1)
  }, [onSortChange, onPageChange])

  if (blogs.length === 0 && total === 0 && !searchQuery) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Analysis Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isAdmin 
              ? "Investment analysis will appear here once generated. The content is dynamically created based on the current system prompt configuration."
              : "Check back soon for the latest investment insights and analysis."}
          </p>
        </div>
      </div>
    )
  }

  if (blogs.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Results Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No blogs match your search for &quot;{searchQuery}&quot;. Try different keywords or clear your search.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters for non-admin users */}
      {!isAdmin && (showSearch || showFilters) && (
        <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4">
          {showSearch && onSearchChange && (
            <div className="flex-1">
              <BlogSearch 
                value={searchQuery}
                onSubmit={onSearchChange}
                placeholder="Press Enter to search investment insights..."
              />
            </div>
          )}
          {showFilters && onFilterChange && (
            <BlogFilters 
              filters={filters}
              onChange={onFilterChange}
            />
          )}
        </div>
      )}

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
              <BlogCardObserver key={blog.id} blog={blog} isAdmin={isAdmin} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              perPage={perPage}
              onPageChange={onPageChange}
            />
          )}
        </TabsContent>

        <TabsContent value="oldest" className="mt-0 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCardObserver key={blog.id} blog={blog} isAdmin={isAdmin} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              perPage={perPage}
              onPageChange={onPageChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
})