"use client"

import { DashboardCard, CardHeader, CardContent } from '@/components/dashboard-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Building2, Copy, Calendar } from 'lucide-react'
import { Expert } from '@/types/expert'
import { motion } from 'motion/react'
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
}

interface AnalysisResultProps {
  result: AnalysisResult
  selectedExpert?: Expert | null
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.analysis)
    toast.success('Analysis copied to clipboard')
  }

  return (
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
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="rounded-full"
            >
              <Copy className="h-3 w-3 mr-2" />
              Copy
            </Button>
          }
        />
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {result.analysis}
              </div>
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
  )
}