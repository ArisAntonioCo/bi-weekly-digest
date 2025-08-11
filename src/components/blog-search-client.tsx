'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useCallback, useState, useEffect } from 'react'
import { BlogSearch } from '@/components/ui/blog-search'
import { BlogFilters } from '@/components/ui/blog-filters'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { BlogFilterOptions } from '@/components/ui/blog-grid'

interface BlogSearchClientProps {
  children: React.ReactNode
  totalCount: number
}

export function BlogSearchClient({ children, totalCount }: BlogSearchClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [sort, setSort] = useState<'latest' | 'oldest'>(
    (searchParams.get('sort') as 'latest' | 'oldest') || 'latest'
  )
  const [filters, setFilters] = useState<BlogFilterOptions>({
    type: (searchParams.get('type') as BlogFilterOptions['type']) || 'all'
  })

  const updateSearchParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset to page 1 when search/filter changes
    if (updates.search !== undefined || updates.type !== undefined) {
      params.delete('page')
    }
    
    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname
    
    startTransition(() => {
      router.replace(url, { scroll: false })
    })
  }, [searchParams, pathname, router])

  // This only updates local state, doesn't trigger search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // This triggers the actual search on Enter or Search button click
  const handleSearchSubmit = useCallback((query: string) => {
    setSearchQuery(query)
    updateSearchParams({ search: query || undefined })
  }, [updateSearchParams])

  const handleSortChange = useCallback((newSort: string) => {
    const sortValue = newSort as 'latest' | 'oldest'
    setSort(sortValue)
    // Use startTransition for smoother updates
    startTransition(() => {
      updateSearchParams({ sort: sortValue })
    })
  }, [updateSearchParams])

  const handleFilterChange = useCallback((newFilters: BlogFilterOptions) => {
    setFilters(newFilters)
    // Use startTransition for smoother updates
    startTransition(() => {
      updateSearchParams({ 
        type: newFilters.type !== 'all' ? newFilters.type : undefined 
      })
    })
  }, [updateSearchParams])

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '')
    setSort((searchParams.get('sort') as 'latest' | 'oldest') || 'latest')
    setFilters({
      type: (searchParams.get('type') as BlogFilterOptions['type']) || 'all'
    })
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="w-full">
          <BlogSearch 
            value={searchQuery}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Press Enter to search investment insights..."
            className={isPending ? 'opacity-50' : ''}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <BlogFilters 
            filters={filters}
            onChange={handleFilterChange}
            className="w-full sm:w-auto"
          />
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
            {totalCount} {totalCount === 1 ? 'Analysis' : 'Analyses'} Available
          </div>
        </div>
      </div>

      <Tabs value={sort} onValueChange={handleSortChange}>
        <div className="mb-4 sm:mb-6">
          <TabsList className="grid w-full sm:w-[320px] grid-cols-2 rounded-full h-10 sm:h-12">
            <TabsTrigger value="latest" className="flex items-center gap-1 sm:gap-2 rounded-full h-8 sm:h-10 text-sm sm:text-base">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              Latest
            </TabsTrigger>
            <TabsTrigger value="oldest" className="flex items-center gap-1 sm:gap-2 rounded-full h-8 sm:h-10 text-sm sm:text-base">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              Oldest
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={sort} className="mt-0">
          {isPending ? (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-muted/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 animate-pulse">
                  <Skeleton className="h-5 w-20 bg-muted/80 rounded-full" />
                  <Skeleton className="h-7 w-full bg-muted/80" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-muted/80" />
                    <Skeleton className="h-4 w-5/6 bg-muted/80" />
                    <Skeleton className="h-4 w-4/6 bg-muted/80" />
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <Skeleton className="h-4 w-24 bg-muted/80" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            children
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}