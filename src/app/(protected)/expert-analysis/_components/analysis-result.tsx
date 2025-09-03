"use client"

import { useState } from 'react'
import { DashboardCard, CardHeader, CardContent } from '@/components/dashboard-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Building2, Copy, Calendar, Expand, Minimize2, DollarSign, TrendingUp, RefreshCw } from 'lucide-react'
import { Expert } from '@/types/expert'
import { motion, AnimatePresence } from 'motion/react'
import { BlogList } from '@/components/ui/blog-list'
import type { Blog } from '@/types/blog'
import { toast } from 'sonner'

interface AnalysisResult {
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
  hold_period?: number
}

interface AnalysisResultProps {
  result: AnalysisResult
  selectedExpert?: Expert | null
  onStartAgain?: () => void
}

export function AnalysisResult({ result, onStartAgain }: AnalysisResultProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.analysis)
    toast.success('Analysis copied to clipboard')
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const blogFromAnalysis: Blog = {
    id: result.id,
    title: `${result.company_name || result.stock_ticker} Analysis` ,
    content: result.analysis,
    created_at: result.timestamp,
  }

  return (
    <>
      {/* Expanded Full-Screen View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg overflow-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 mb-6 border-b border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-12 sm:h-14 w-12 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 sm:h-7 w-6 sm:w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        {result.company_name || result.stock_ticker}
                      </h2>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                        <Badge variant="outline" className="font-mono text-xs sm:text-sm">
                          {result.stock_ticker}
                        </Badge>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Analysis by {result.expert_name}
                        </span>
                        {result.hold_period && (
                          <Badge variant="secondary" className="text-xs sm:text-sm">
                            Horizon: {result.hold_period}y
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 sm:gap-4">
                    {/* Floating Metrics Card */}
                    {result.current_price && (
                      <div className="hidden sm:block bg-muted/50 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Current Price</p>
                            <p className="text-xl font-bold">${result.current_price}</p>
                          </div>
                        </div>
                        {result.market_cap && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Market Cap</p>
                              <p className="text-xl font-bold">{result.market_cap}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleExpand}
                      className="rounded-full"
                    >
                      <Minimize2 className="h-4 sm:h-5 w-4 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Analysis Content - Full Width */}
              <div className="bg-muted/30 rounded-3xl p-4 sm:p-8">
                <div className="prose prose-lg max-w-none">
                  <BlogList blogs={[blogFromAnalysis]} />
                </div>
              </div>

              {/* Fixed Bottom Actions Bar */}
              <div className="sticky bottom-0 mt-6 sm:mt-8 py-3 sm:py-4 bg-background/80 backdrop-blur-md border-t border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-3 sm:h-4 w-3 sm:w-4" />
                    Generated {new Date(result.timestamp).toLocaleString()}
                  </div>
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className="rounded-full w-full sm:w-auto"
                  >
                    <Copy className="h-3 sm:h-4 w-3 sm:w-4 mr-2" />
                    Copy Analysis
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default Collapsed View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        {/* Header Card */}
        <DashboardCard variant="compact" padding="medium">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {result.company_name || result.stock_ticker}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono">
                    {result.stock_ticker}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    by {result.expert_name}
                  </span>
                  {result.hold_period && (
                    <Badge variant="secondary" className="text-xs">
                      {result.hold_period}y horizon
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Metrics */}
            {result.current_price && (
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-lg font-semibold">${result.current_price}</p>
                </div>
                {result.market_cap && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Market Cap</p>
                    <p className="text-lg font-semibold">{result.market_cap}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Analysis Content */}
        <DashboardCard variant="highlight" padding="medium">
          <CardHeader
            title="Investment Analysis"
            subtitle={`Based on ${result.expert_name}'s framework`}
            action={
              <div className="flex gap-2">
                {onStartAgain && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onStartAgain}
                    className="rounded-full"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    New Analysis
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="rounded-full"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleExpand}
                  className="rounded-full"
                >
                  <Expand className="h-3 w-3 mr-2" />
                  Expand
                </Button>
              </div>
            }
          />
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="prose prose-lg max-w-none">
                <BlogList blogs={[blogFromAnalysis]} />
              </div>
            </ScrollArea>
            
            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Generated {new Date(result.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </DashboardCard>
      </motion.div>
    </>
  )
}
