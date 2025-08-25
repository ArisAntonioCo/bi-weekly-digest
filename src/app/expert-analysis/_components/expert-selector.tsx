"use client"

import { useState, useMemo } from 'react'
import { DashboardCard, CardHeader, CardContent } from '@/components/dashboard-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Check, Search, ArrowUpDown } from 'lucide-react'
import { Expert } from '@/types/expert'
import { motion } from 'motion/react'
import { toast } from 'sonner'

interface ExpertSelectorProps {
  experts: Expert[]
  selectedExperts: Expert[]
  onSelectExperts: (experts: Expert[]) => void
}

type SortOption = 'name-asc' | 'name-desc' | 'default'

export function ExpertSelector({ experts, selectedExperts, onSelectExperts }: ExpertSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('default')
  
  // Filter and sort experts
  const filteredAndSortedExperts = useMemo(() => {
    let filtered = experts
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = experts.filter(expert => 
        expert.name.toLowerCase().includes(query) ||
        expert.title?.toLowerCase().includes(query) ||
        expert.investing_law?.toLowerCase().includes(query) ||
        expert.framework_description?.toLowerCase().includes(query)
      )
    }
    
    // Apply sorting
    const sorted = [...filtered]
    switch (sortOption) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // Keep original order
        break
    }
    
    return sorted
  }, [experts, searchQuery, sortOption])
  
  const toggleExpert = (expert: Expert) => {
    const isSelected = selectedExperts.some(e => e.id === expert.id)
    
    if (isSelected) {
      // Remove expert
      onSelectExperts(selectedExperts.filter(e => e.id !== expert.id))
    } else {
      // Add expert (max 3)
      if (selectedExperts.length >= 3) {
        toast.error('Maximum 3 experts can be selected')
        return
      }
      onSelectExperts([...selectedExperts, expert])
    }
  }

  const clearSelection = () => {
    onSelectExperts([])
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <DashboardCard variant="default" padding="medium">
        <CardHeader
          title="Select Experts"
          subtitle={`Choose up to 3 frameworks (${selectedExperts.length}/3)`}
          icon={<User className="h-5 w-5 text-foreground" />}
          action={
            selectedExperts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-xs h-7"
              >
                Clear all
              </Button>
            )
          }
        />
        <CardContent>
          {/* Search and Sort Controls */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="h-[calc(100vh-380px)] pr-3">
            <div className="space-y-3">
              {filteredAndSortedExperts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No experts found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredAndSortedExperts.map(expert => {
                  const isSelected = selectedExperts.some(e => e.id === expert.id)
                  return (
                  <div
                    key={expert.id}
                    onClick={() => toggleExpert(expert)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all relative ${
                      isSelected 
                        ? 'bg-foreground text-background' 
                        : 'bg-background/50 hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div className="absolute right-4 top-4">
                      {isSelected ? (
                        <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center">
                          <Check className="h-4 w-4 text-foreground" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    
                    {/* Expert Info */}
                    <div className="pr-10 space-y-2">
                      <div className="flex items-center gap-3">
                        {expert.avatar_seed && (
                          <img
                            src={(() => {
                              const colors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
                              const colorIndex = expert.avatar_seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
                              return `https://api.dicebear.com/9.x/notionists/svg?seed=${expert.avatar_seed}&backgroundColor=${colors[colorIndex]}`
                            })()}
                            alt={`${expert.name} avatar`}
                            className="w-10 h-10 rounded-full bg-background/10 flex-shrink-0"
                          />
                        )}
                        <div>
                          <div className={`font-semibold text-base ${isSelected ? 'text-background' : 'text-foreground'}`}>
                            {expert.name}
                          </div>
                          {expert.title && (
                            <p className={`text-xs ${isSelected ? 'text-background/80' : 'text-muted-foreground'}`}>
                              {expert.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs italic line-clamp-2 ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>
                        &quot;{expert.investing_law}&quot;
                      </p>
                      {expert.framework_description && (
                        <div className="mt-3">
                          <p className={`text-xs line-clamp-2 ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>
                            {expert.framework_description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </DashboardCard>
    </motion.div>
  )
}