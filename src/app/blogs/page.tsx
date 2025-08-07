"use client"

import { useCallback } from 'react'
import { TrendingUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BlogGrid } from '@/components/ui/blog-grid'
import { useBlogSearch } from '@/hooks/use-blog-search'
import { Skeleton } from '@/components/ui/skeleton'
import { BlogFilterOptions } from '@/components/ui/blog-grid'

export default function BlogsPage() {
  const {
    blogs,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    searchQuery,
    sort,
    filters,
    systemPromptSummary,
    setPage,
    setSort,
    setSearchQuery,
    setFilters
  } = useBlogSearch({
    perPage: 9
  })

  // Memoize handlers to prevent unnecessary re-renders
  const handlePageChange = useCallback((page: number) => {
    setPage(page)
  }, [setPage])

  const handleSortChange = useCallback((newSort: 'latest' | 'oldest') => {
    setSort(newSort)
  }, [setSort])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [setSearchQuery])

  const handleFilterChange = useCallback((newFilters: BlogFilterOptions) => {
    setFilters(newFilters)
  }, [setFilters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-zinc-100 text-zinc-900 flex size-8 items-center justify-center rounded-md">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-zinc-100">Investment Insights</h1>
                  <p className="text-xs text-zinc-400 hidden sm:block">AI-Powered Market Analysis</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* System Prompt Summary */}
        {systemPromptSummary && !loading && (
          <div className="mb-8 p-4 bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700">
            <p className="text-sm text-zinc-300 text-center">
              {systemPromptSummary}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1 bg-zinc-800" />
              <Skeleton className="h-10 w-40 bg-zinc-800" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 bg-zinc-800" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-400">Error loading blogs: {error}</p>
          </div>
        )}

        {/* Blog Grid */}
        {!loading && !error && (
          <BlogGrid
            blogs={blogs}
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            perPage={9}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            currentSort={sort}
            searchQuery={searchQuery}
            filters={filters}
            isAdmin={false}
            showSearch={true}
            showFilters={true}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-zinc-500 text-sm">
            © 2024 Weekly Digest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}