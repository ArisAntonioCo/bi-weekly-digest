"use client"

import { useState, useEffect, useCallback } from 'react'
import { ExpertHeader } from '../_sections/expert-header'
import { ExpertList } from '../_sections/expert-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Expert } from '@/types/expert'

export function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const fetchExperts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter)
      }
      
      if (statusFilter !== 'all') {
        params.append('active', statusFilter === 'active' ? 'true' : 'false')
      }
      
      const response = await fetch(`/api/experts?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch experts')
      }
      
      const data: Expert[] = await response.json()
      setExperts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, categoryFilter, statusFilter])

  useEffect(() => {
    fetchExperts()
  }, [fetchExperts])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category)
  }

  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status)
  }

  const handleExpertUpdate = (updatedExpert: Expert) => {
    setExperts(prev => prev.map(e => 
      e.id === updatedExpert.id ? updatedExpert : e
    ))
  }

  const handleExpertDelete = (expertId: string) => {
    setExperts(prev => prev.filter(e => e.id !== expertId))
  }

  const handleExpertAdd = (newExpert: Expert) => {
    setExperts(prev => [...prev, newExpert])
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
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <ExpertHeader 
          totalExperts={experts.length}
          activeExperts={experts.filter(e => e.is_active).length}
          defaultExperts={experts.filter(e => e.is_default).length}
          onAddExpert={handleExpertAdd}
        />
        <ExpertList 
          experts={experts}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          onExpertUpdate={handleExpertUpdate}
          onExpertDelete={handleExpertDelete}
        />
      </div>
    </div>
  )
}