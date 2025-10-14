"use client"

import { useState } from 'react'
import { ExpertHeader } from '../_sections/expert-header'
import { ExpertList } from '../_sections/expert-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Expert } from '@/types/expert'
import { useExperts, useBulkUpdateExperts } from '@/hooks/use-experts'

export function ExpertsPage() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9) // 3x3 grid on desktop
  
  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedExperts, setSelectedExperts] = useState<string[]>([])

  // Use SWR hook for fetching experts
  const { 
    experts, 
    total: totalCount, 
    isLoading: loading, 
    error,
    revalidate 
  } = useExperts({
    search: searchQuery,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  })

  // Use bulk update hook
  const { bulkUpdate } = useBulkUpdateExperts()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page on filter change
  }


  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSortChange = (newSortBy: 'name' | 'created_at') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }

  const handleExpertUpdate = async () => {
    // Revalidate the data after update
    await revalidate()
  }

  const handleExpertDelete = async () => {
    // Revalidate the data after delete
    await revalidate()
  }

  const handleExpertAdd = async () => {
    // Revalidate to show the new expert
    await revalidate()
  }

  const handleSelectExpert = (expertId: string, selected: boolean) => {
    if (selected) {
      setSelectedExperts(prev => [...prev, expertId])
    } else {
      setSelectedExperts(prev => prev.filter(id => id !== expertId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedExperts(experts.map((e: Expert) => e.id))
    } else {
      setSelectedExperts([])
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'delete') {
      await bulkUpdate(selectedExperts, action)
    } else {
      // Activate/deactivate not supported in simplified version
      return
    }
    
    // Clear selection after action
    setSelectedExperts([])
    setSelectionMode(false)
    
    // Revalidate the list
    await revalidate()
  }

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    if (selectionMode) {
      setSelectedExperts([]) // Clear selection when exiting selection mode
    }
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
          <h1 className="text-2xl font-bold text-destructive">Error Loading Experts</h1>
          <p className="text-muted-foreground">{error?.message || 'An error occurred'}</p>
          <Button onClick={() => revalidate()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <ExpertHeader 
          totalExperts={totalCount || experts.length}
          onAddExpert={handleExpertAdd}
        />
        <ExpertList 
          experts={experts}
          searchQuery={searchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
          currentPage={currentPage}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          selectionMode={selectionMode}
          selectedExperts={selectedExperts}
          onSearch={handleSearch}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onExpertUpdate={handleExpertUpdate}
          onExpertDelete={handleExpertDelete}
          onSelectExpert={handleSelectExpert}
          onSelectAll={handleSelectAll}
          onBulkAction={handleBulkAction}
          onToggleSelectionMode={handleToggleSelectionMode}
        />
      </div>
    </div>
  )
}