"use client"

import { DashboardCard } from '@/components/dashboard-card'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { Badge } from '@/components/ui/badge'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Expert } from '@/types/expert'
import { Sparkles } from 'lucide-react'

interface LoadingStateProps {
  stockTicker: string
  selectedExperts: Expert[]
}

export function LoadingState({ stockTicker, selectedExperts }: LoadingStateProps) {
  // Lightweight progressive steps to improve perceived progress
  const [step, setStep] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    // 5s Fetching → 10s Analyzing → Complete for the remaining time
    const t1 = setTimeout(() => setStep(1), 5000) // 0-5s Fetching, then Analyzing
    const t2 = setTimeout(() => setStep(2), 15000) // 5-15s Analyzing, then Complete
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])
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
              {/* Step 0: Fetching */}
              <div className="flex flex-col items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 0 ? 'bg-primary' : 'border-2 border-muted'}`}>
                  <div className={`h-3 w-3 rounded-full ${step === 0 ? 'bg-primary-foreground animate-pulse' : step > 0 ? 'bg-primary-foreground' : 'bg-muted'}`} />
                </div>
                <span className="text-[10px] text-muted-foreground">Fetching</span>
              </div>

              {/* Connector */}
              <div className={`h-px w-12 ${step >= 1 ? 'bg-primary/70' : 'bg-muted'}`} />

              {/* Step 1: Analyzing */}
              <div className="flex flex-col items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary' : 'border-2 border-muted'}`}>
                  <div className={`h-3 w-3 rounded-full ${step === 1 ? 'bg-primary-foreground animate-pulse' : step > 1 ? 'bg-primary-foreground' : 'bg-muted'}`} />
                </div>
                <span className="text-[10px] text-muted-foreground">Analyzing</span>
              </div>

              {/* Connector */}
              <div className={`h-px w-12 ${step >= 2 ? 'bg-primary/70' : 'bg-muted'}`} />

              {/* Step 2: Complete (formatting) */}
              <div className="flex flex-col items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary' : 'border-2 border-muted'}`}>
                  <div className={`h-3 w-3 rounded-full ${step === 2 ? 'bg-primary-foreground animate-pulse' : step < 2 ? 'bg-muted' : 'bg-primary-foreground'}`} />
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
