"use client"

import { useEffect, useState, memo, useCallback, KeyboardEvent } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BlogSearchProps {
  value: string
  onChange?: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  className?: string
}

export const BlogSearch = memo(function BlogSearch({ 
  value, 
  onChange,
  onSubmit,
  placeholder = "Search blogs...",
  className
}: BlogSearchProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    // Only call onChange if provided (for immediate feedback without search)
    if (onChange) {
      onChange(newValue)
    }
  }, [onChange])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit(localValue)
    }
  }, [localValue, onSubmit])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onSubmit('')
  }, [onSubmit])

  const handleSearchClick = useCallback(() => {
    onSubmit(localValue)
  }, [localValue, onSubmit])

  return (
    <div className={cn("relative flex gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 rounded-full h-12 text-base"
        />
        {localValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      <Button
        type="button"
        onClick={handleSearchClick}
        className="px-6 rounded-full"
        variant="default"
        size="lg"
      >
        Search
      </Button>
    </div>
  )
})