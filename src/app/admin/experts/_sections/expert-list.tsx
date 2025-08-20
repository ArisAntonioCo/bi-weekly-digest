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
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, CheckSquare, Square, Trash2, ListChecks } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { ExpertCard } from './expert-card'
import { Expert } from '@/types/expert'
import { Badge } from '@/components/ui/badge'
import { motion } from 'motion/react'

interface ExpertListProps {
  experts: Expert[]
  searchQuery: string
  categoryFilter: string
  statusFilter: 'all' | 'active' | 'inactive'
  typeFilter: 'all' | 'default' | 'custom'
  sortBy: 'name' | 'created_at' | 'display_order'
  sortOrder: 'asc' | 'desc'
  currentPage: number
  totalCount: number
  itemsPerPage: number
  selectionMode: boolean
  selectedExperts: string[]
  onSearch: (query: string) => void
  onCategoryChange: (category: string) => void
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void
  onTypeChange: (type: 'all' | 'default' | 'custom') => void
  onSortChange: (sortBy: 'name' | 'created_at' | 'display_order') => void
  onPageChange: (page: number) => void
  onExpertUpdate: (expert: Expert) => void
  onExpertDelete: (expertId: string) => void
  onSelectExpert: (expertId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onBulkAction: (action: 'activate' | 'deactivate' | 'delete') => void
  onToggleSelectionMode: () => void
}

export function ExpertList({
  experts,
  searchQuery,
  categoryFilter,
  statusFilter,
  typeFilter,
  sortBy,
  sortOrder,
  currentPage,
  totalCount,
  itemsPerPage,
  selectionMode,
  selectedExperts,
  onSearch,
  onCategoryChange,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onPageChange,
  onExpertUpdate,
  onExpertDelete,
  onSelectExpert,
  onSelectAll,
  onBulkAction,
  onToggleSelectionMode,
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
    onTypeChange('all')
  }

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all'
  const hasSelection = selectedExperts.length > 0
  const allSelected = experts.length > 0 && selectedExperts.length === experts.length
  
  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectionMode && hasSelection && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/50 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => onSelectAll(!!checked)}
              aria-label="Select all experts"
            />
            <span className="text-sm font-medium">
              {selectedExperts.length} expert{selectedExperts.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('activate')}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('deactivate')}
            >
              <Square className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedExperts.length} expert${selectedExperts.length !== 1 ? 's' : ''}?`)) {
                  onBulkAction('delete')
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </motion.div>
      )}

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
          {/* Selection Mode Toggle */}
          <Button
            variant={selectionMode ? "default" : "outline"}
            size="default"
            onClick={onToggleSelectionMode}
            className="h-10"
          >
            <ListChecks className="h-4 w-4 mr-2" />
            {selectionMode ? 'Exit Selection' : 'Select'}
          </Button>

          {/* Select All Checkbox when in selection mode */}
          {selectionMode && experts.length > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Select all experts"
              />
              <label className="text-sm text-muted-foreground">Select all</label>
            </div>
          )}
          
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
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
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="default">Default Experts</SelectItem>
              <SelectItem value="custom">Custom Experts</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="default"
              onClick={() => onSortChange(sortBy)}
              className="h-10"
            >
              {sortBy === 'name' && 'Name'}
              {sortBy === 'created_at' && 'Date'}
              {sortBy === 'display_order' && 'Order'}
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4 ml-1" />
              ) : (
                <ArrowDown className="h-4 w-4 ml-1" />
              )}
            </Button>
            <Select value={sortBy} onValueChange={(value) => onSortChange(value as 'name' | 'created_at' | 'display_order')}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2 flex-shrink-0" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="display_order">Display Order</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            {typeFilter !== 'all' && (
              <Badge variant="secondary">
                Type: {typeFilter === 'default' ? 'Default' : 'Custom'}
                <button
                  onClick={() => onTypeChange('all')}
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
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert) => (
              <div key={expert.id} className="relative">
                {selectionMode && (
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedExperts.includes(expert.id)}
                      onCheckedChange={(checked) => onSelectExpert(expert.id, !!checked)}
                      aria-label={`Select ${expert.name}`}
                      className="bg-background border-2"
                    />
                  </div>
                )}
                <ExpertCard
                  expert={expert}
                  onUpdate={onExpertUpdate}
                  onDelete={onExpertDelete}
                />
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} - {Math.min(endIndex, totalCount)} of {totalCount} experts
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-10"
                        onClick={() => onPageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}