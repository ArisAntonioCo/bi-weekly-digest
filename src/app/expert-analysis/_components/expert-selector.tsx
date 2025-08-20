"use client"

import { DashboardCard, CardHeader, CardContent } from '@/components/dashboard-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { User, Target, Sparkles } from 'lucide-react'
import { Expert } from '@/types/expert'
import { motion } from 'motion/react'

interface ExpertSelectorProps {
  experts: Expert[]
  selectedExpert: Expert | null
  onSelectExpert: (expert: Expert) => void
}

export function ExpertSelector({ experts, selectedExpert, onSelectExpert }: ExpertSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      <DashboardCard variant="default" padding="medium">
        <CardHeader
          title="Select Expert"
          subtitle="Choose an investment framework"
          icon={<User className="h-5 w-5 text-foreground" />}
        />
        <CardContent>
          <ScrollArea className="h-[400px] pr-3">
            <div className="space-y-2">
              {experts.map(expert => {
                const isSelected = selectedExpert?.id === expert.id
                return (
                  <div
                    key={expert.id}
                    onClick={() => onSelectExpert(expert)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all relative ${
                      isSelected 
                        ? 'bg-primary/10 ring-1 ring-primary' 
                        : 'bg-background/50 hover:bg-muted/50'
                    }`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute right-3 top-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      </div>
                    )}
                    
                    {/* Expert Info */}
                    <div className="space-y-2">
                      <div className="font-semibold text-foreground">
                        {expert.name}
                      </div>
                      {expert.title && (
                        <p className="text-xs text-muted-foreground">
                          {expert.title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        "{expert.investing_law}"
                      </p>
                      {expert.focus_areas && (
                        <div className="flex flex-wrap gap-1">
                          {expert.focus_areas.split(',').slice(0, 2).map((area, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary"
                              className="text-[10px] px-2 py-0 h-5"
                            >
                              {area.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </DashboardCard>

      {/* Selected Expert Card */}
      {selectedExpert && (
        <DashboardCard variant="compact" padding="small" className="bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {selectedExpert.name}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {selectedExpert.investing_law}
              </p>
            </div>
          </div>
        </DashboardCard>
      )}
    </motion.div>
  )
}