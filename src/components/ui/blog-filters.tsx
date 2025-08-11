"use client"

import { memo, useCallback } from 'react'
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BlogFilterOptions } from './blog-grid'

interface BlogFiltersProps {
  filters?: BlogFilterOptions
  onChange: (filters: BlogFilterOptions) => void
  className?: string
}

const filterTypes = [
  { value: 'all', label: 'All', icon: null },
  { value: 'moic', label: 'MOIC', icon: TrendingUp },
  { value: 'risk', label: 'Risk', icon: AlertTriangle },
  { value: 'insight', label: 'Insights', icon: Lightbulb },
]

export const BlogFilters = memo(function BlogFilters({ filters = {}, onChange, className }: BlogFiltersProps) {
  const currentType = filters.type || 'all'

  const handleTypeChange = useCallback((type: string) => {
    onChange({
      ...filters,
      type: type as BlogFilterOptions['type']
    })
  }, [filters, onChange])

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {filterTypes.map((type) => {
        const TypeIcon = type.icon
        const isActive = currentType === type.value
        return (
          <Button
            key={type.value}
            variant={isActive ? "default" : "outline"}
            size="lg"
            onClick={() => handleTypeChange(type.value)}
            className={cn(
              "rounded-full px-6",
              isActive && "shadow-sm"
            )}
          >
            {TypeIcon && <TypeIcon className="h-4 w-4 mr-2" />}
            {type.label}
          </Button>
        )
      })}
    </div>
  )
})