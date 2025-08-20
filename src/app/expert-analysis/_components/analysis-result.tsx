"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Building2, User, DollarSign, TrendingUp, Info, Shield, Brain, LineChart, Briefcase } from 'lucide-react'
import { Expert } from '@/types/expert'

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

// Helper function to get category color
function getCategoryColor(category?: string) {
  switch (category) {
    case 'value':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'growth':
      return 'bg-green-500/10 text-green-600 border-green-500/20'
    case 'tech':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    case 'macro':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}

export function AnalysisResult({ result, selectedExpert }: AnalysisResultProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              {result.company_name || result.stock_ticker}
            </CardTitle>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{result.expert_name}</span>
                {selectedExpert?.category && (
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ml-1 ${getCategoryColor(selectedExpert.category)}`}
                  >
                    {selectedExpert.category.toUpperCase()}
                  </Badge>
                )}
              </div>
              {selectedExpert?.focus_areas && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-medium mb-1">Expert Focus</p>
                        <p className="text-xs">{selectedExpert.focus_areas}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-lg">
            {result.stock_ticker}
          </Badge>
        </div>

        {/* Stock Metrics */}
        {result.current_price && (
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">${result.current_price}</span>
            </div>
            {result.market_cap && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Market Cap: {result.market_cap}
                </span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{result.analysis}</div>
          </div>
        </ScrollArea>
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Generated {new Date(result.timestamp).toLocaleString()}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigator.clipboard.writeText(result.analysis)}
          >
            Copy Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}