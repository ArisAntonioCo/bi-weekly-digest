"use client"

import { useState, memo, useCallback } from 'react'
import { Filter, TrendingUp, AlertTriangle, Lightbulb, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { BlogFilterOptions } from './blog-grid'

interface BlogFiltersProps {
  filters?: BlogFilterOptions
  onChange: (filters: BlogFilterOptions) => void
  className?: string
}

const filterTypes = [
  { value: 'all', label: 'All Types', icon: null },
  { value: 'moic', label: 'MOIC Analysis', icon: TrendingUp },
  { value: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
  { value: 'insight', label: 'Investment Insight', icon: Lightbulb },
]

export const BlogFilters = memo(function BlogFilters({ filters = {}, onChange, className }: BlogFiltersProps) {
  const [open, setOpen] = useState(false)
  const currentType = filters.type || 'all'
  
  const activeFiltersCount = [
    filters.type && filters.type !== 'all',
    filters.dateRange?.from,
    filters.dateRange?.to
  ].filter(Boolean).length

  const handleTypeChange = useCallback((type: string) => {
    onChange({
      ...filters,
      type: type as BlogFilterOptions['type']
    })
  }, [filters, onChange])

  const clearFilters = useCallback(() => {
    onChange({})
  }, [onChange])

  const currentFilter = filterTypes.find(f => f.value === currentType)
  const Icon = currentFilter?.icon

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="min-w-[160px] justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {Icon && <Icon className="h-3 w-3" />}
              {currentFilter?.label}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterTypes.map((type) => {
            const TypeIcon = type.icon
            return (
              <DropdownMenuCheckboxItem
                key={type.value}
                checked={currentType === type.value}
                onCheckedChange={() => handleTypeChange(type.value)}
              >
                <span className="flex items-center gap-2">
                  {TypeIcon && <TypeIcon className="h-3 w-3" />}
                  {type.label}
                </span>
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFiltersCount > 0 && (
        <>
          <Badge variant="secondary" className="gap-1">
            {activeFiltersCount} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs"
          >
            Clear
          </Button>
        </>
      )}
    </div>
  )
})