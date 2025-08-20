"use client"

import { DashboardCard } from '@/components/dashboard-card'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { motion } from 'motion/react'

interface EmptyStateProps {
  recentAnalyses: Array<{
    id: string
    stock_ticker: string
    expert_name: string
    timestamp: string
  }>
  onSelectAnalysis: (analysis: any) => void
}

export function EmptyState({ recentAnalyses, onSelectAnalysis }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <DashboardCard variant="highlight" padding="large">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
          {/* Animated Orb */}
          <AnimatedOrb className="mb-8" />
          
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            Ready to Analyze
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Select an expert framework and enter a stock ticker to get AI-powered insights
          </p>

          {/* Recent Analyses */}
          {recentAnalyses.length > 0 && (
            <div className="mt-12 w-full max-w-md">
              <p className="text-sm font-medium text-muted-foreground mb-4">Recent Analyses</p>
              <div className="space-y-2">
                {recentAnalyses
                  .filter(analysis => analysis && analysis.stock_ticker && analysis.expert_name && analysis.id)
                  .slice(0, 3)
                  .map(analysis => (
                    <button
                      key={analysis.id}
                      className="w-full p-4 rounded-2xl bg-background/50 hover:bg-muted/50 transition-all text-left group"
                      onClick={() => onSelectAnalysis(analysis)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-semibold text-sm">{analysis.stock_ticker}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            by {analysis.expert_name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {analysis.timestamp ? new Date(analysis.timestamp).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DashboardCard>
    </motion.div>
  )
}