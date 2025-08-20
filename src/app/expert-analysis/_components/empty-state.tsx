"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Zap } from 'lucide-react'

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
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Ready to Analyze</h3>
            <p className="text-muted-foreground mt-2">
              Select an expert and enter a stock ticker to get started
            </p>
          </div>

          {/* Recent Analyses */}
          {recentAnalyses.length > 0 && (
            <div className="mt-8 text-left">
              <h4 className="text-sm font-semibold mb-3">Recent Analyses</h4>
              <div className="space-y-2">
                {recentAnalyses
                  .filter(analysis => analysis && analysis.stock_ticker && analysis.expert_name && analysis.id)
                  .map(analysis => (
                    <div
                      key={analysis.id}
                      className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => onSelectAnalysis(analysis)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{analysis.stock_ticker}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            by {analysis.expert_name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {analysis.timestamp ? new Date(analysis.timestamp).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}