"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X } from 'lucide-react'
import { ExpertCard } from './expert-card'
import { Expert } from '@/types/expert'
import { Badge } from '@/components/ui/badge'

interface ExpertListProps {
  experts: Expert[]
  searchQuery: string
  categoryFilter: string
  statusFilter: 'all' | 'active' | 'inactive'
  onSearch: (query: string) => void
  onCategoryChange: (category: string) => void
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void
  onExpertUpdate: (expert: Expert) => void
  onExpertDelete: (expertId: string) => void
}

export function ExpertList({
  experts,
  searchQuery,
  categoryFilter,
  statusFilter,
  onSearch,
  onCategoryChange,
  onStatusChange,
  onExpertUpdate,
  onExpertDelete,
}: ExpertListProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localSearch)
  }

  const clearFilters = () => {
    setLocalSearch('')
    onSearch('')
    onCategoryChange('all')
    onStatusChange('all')
  }

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search experts..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
              <SelectItem value="macro">Macro</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Clear filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary">
                Search: {searchQuery}
                <button
                  onClick={() => {
                    setLocalSearch('')
                    onSearch('')
                  }}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="secondary">
                Category: {categoryFilter}
                <button
                  onClick={() => onCategoryChange('all')}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary">
                Status: {statusFilter}
                <button
                  onClick={() => onStatusChange('all')}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Expert Grid */}
      {experts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No experts found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onUpdate={onExpertUpdate}
              onDelete={onExpertDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}