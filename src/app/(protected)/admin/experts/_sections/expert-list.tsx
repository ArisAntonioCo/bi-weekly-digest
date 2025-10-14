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
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ExpertCard } from './expert-card'
import { Expert } from '@/types/expert'
import { Badge } from '@/components/ui/badge'
import { motion } from 'motion/react'

interface ExpertListProps {
  experts: Expert[]
  searchQuery: string
  sortBy: 'name' | 'created_at'
  sortOrder: 'asc' | 'desc'
  currentPage: number
  totalCount: number
  itemsPerPage: number
  selectedExperts: string[]
  onSearch: (query: string) => void
  onSortChange: (sortBy: 'name' | 'created_at') => void
  onPageChange: (page: number) => void
  onExpertUpdate: (expert: Expert) => void
  onExpertDelete: (expertId: string) => void
  onSelectExpert: (expertId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onBulkAction: (action: 'activate' | 'deactivate' | 'delete') => void
}

export function ExpertList({
  experts,
  searchQuery,
  sortBy,
  sortOrder,
  currentPage,
  totalCount,
  itemsPerPage,
  selectedExperts,
  onSearch,
  onSortChange,
  onPageChange,
  onExpertUpdate,
  onExpertDelete,
  onSelectExpert,
  onSelectAll,
  onBulkAction,
}: ExpertListProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localSearch)
  }

  const clearFilters = () => {
    setLocalSearch('')
    onSearch('')
  }

  const hasActiveFilters = searchQuery
  const hasSelection = selectedExperts.length > 0
  const allSelected = experts.length > 0 && selectedExperts.length === experts.length
  
  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {hasSelection && (
        <>
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
                variant="ghost"
                size="sm"
                onClick={() => onSelectAll(false)}
              >
                Unselect all
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setIsBulkDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </motion.div>

          <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete selected experts?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove {selectedExperts.length} expert{selectedExperts.length !== 1 ? 's' : ''}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    try {
                      await onBulkAction('delete')
                    } finally {
                      setIsBulkDeleteOpen(false)
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
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
          <div>
            <Select value={sortBy} onValueChange={(value) => onSortChange(value as 'name' | 'created_at')}>
              <SelectTrigger className="w-[200px]">
                <ArrowUpDown className="h-4 w-4 mr-2 flex-shrink-0" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
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
                <ExpertCard
                  expert={expert}
                  onUpdate={onExpertUpdate}
                  onDelete={onExpertDelete}
                  selected={selectedExperts.includes(expert.id)}
                  onToggleSelect={(expertId) => {
                    const isSelected = selectedExperts.includes(expertId)
                    onSelectExpert(expertId, !isSelected)
                  }}
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
