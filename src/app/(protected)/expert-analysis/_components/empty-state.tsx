"use client"

import { DashboardCard } from '@/components/dashboard-card'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { Badge } from '@/components/ui/badge'
import { motion } from 'motion/react'
import { Expert } from '@/types/expert'
import { Sparkles, X } from 'lucide-react'

interface AnalysisType {
  id: string
  stock_ticker: string
  company_name: string
  expert_name: string
  expert_id: string
  analysis: string
  timestamp: string
  current_price?: number
  market_cap?: string
  pe_ratio?: number
}

interface EmptyStateProps {
  selectedExperts: Expert[]
  onRemoveExpert?: (expert: Expert) => void
  recentAnalyses: AnalysisType[]
  onSelectAnalysis: (analysis: AnalysisType | null) => void
}

export function EmptyState({ selectedExperts, onRemoveExpert, recentAnalyses, onSelectAnalysis }: EmptyStateProps) {
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
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm font-medium text-foreground">
              Selected ({selectedExperts.length}/5):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedExperts.map(expert => (
                <Badge 
                  key={expert.id} 
                  variant="secondary"
                  className="text-sm pr-1.5 group cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => onRemoveExpert?.(expert)}
                >
                  {expert.name}
                  <X className="h-3.5 w-3.5 ml-1.5 opacity-60 group-hover:opacity-100" />
                </Badge>
              ))}
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Main Empty State */}
      <DashboardCard variant="highlight" padding="large">
        <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
          {/* Animated Orb */}
          <AnimatedOrb className="mb-8" />
          
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            Ready to Analyze
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {selectedExperts.length > 0 
              ? `Enter a stock ticker to analyze with ${selectedExperts.length === 1 ? 'your selected expert' : 'your selected experts'}`
              : 'Select experts and enter a stock ticker to get AI-powered insights'
            }
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
