"use client"

import { DashboardCard } from '@/components/dashboard-card'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { Badge } from '@/components/ui/badge'
import { motion } from 'motion/react'
import { Expert } from '@/types/expert'
import { Sparkles } from 'lucide-react'

interface LoadingStateProps {
  stockTicker: string
  selectedExperts: Expert[]
}

export function LoadingState({ stockTicker, selectedExperts }: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      {/* Selected Experts Display */}
      {selectedExperts.length > 0 && (
        <DashboardCard variant="compact" padding="small" className="bg-muted/30">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0 animate-pulse" />
            <p className="text-sm font-medium text-foreground">
              Analyzing with ({selectedExperts.length}/3):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedExperts.map(expert => (
                <Badge 
                  key={expert.id} 
                  variant="secondary"
                  className="text-sm"
                >
                  {expert.name}
                </Badge>
              ))}
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Loading Animation */}
      <DashboardCard variant="highlight" padding="large">
        <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
          <AnimatedOrb size="lg" className="mb-8" />
          
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-foreground">
              Analyzing {stockTicker}
            </h3>
            <p className="text-muted-foreground">
              {selectedExperts.length === 1 
                ? `Applying ${selectedExperts[0].name}'s investment framework`
                : `Combining insights from ${selectedExperts.length} expert frameworks`
              }
            </p>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary-foreground animate-pulse" />
                </div>
                <span className="text-[10px] text-muted-foreground">Fetching</span>
              </div>
              
              <div className="h-px w-12 bg-primary/50" />
              
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full border-2 border-muted flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-muted" />
                </div>
                <span className="text-[10px] text-muted-foreground">Analyzing</span>
              </div>
              
              <div className="h-px w-12 bg-muted" />
              
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full border-2 border-muted flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-muted" />
                </div>
                <span className="text-[10px] text-muted-foreground">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </motion.div>
  )
}