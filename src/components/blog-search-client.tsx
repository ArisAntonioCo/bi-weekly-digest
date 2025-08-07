'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useCallback, useState, useEffect } from 'react'
import { BlogSearch } from '@/components/ui/blog-search'
import { BlogFilters } from '@/components/ui/blog-filters'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Calendar } from 'lucide-react'
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
    updateSearchParams({ sort: sortValue })
  }, [updateSearchParams])

  const handleFilterChange = useCallback((newFilters: BlogFilterOptions) => {
    setFilters(newFilters)
    updateSearchParams({ 
      type: newFilters.type !== 'all' ? newFilters.type : undefined 
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
      <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4">
        <div className="flex-1">
          <BlogSearch 
            value={searchQuery}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Press Enter to search investment insights..."
            className={isPending ? 'opacity-50' : ''}
          />
        </div>
        <BlogFilters 
          filters={filters}
          onChange={handleFilterChange}
        />
      </div>

      <Tabs value={sort} onValueChange={handleSortChange}>
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
            {totalCount} {totalCount === 1 ? 'Analysis' : 'Analyses'} Available
          </div>
        </div>

        <TabsContent value={sort} className="mt-0">
          <div className={isPending ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
            {children}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}