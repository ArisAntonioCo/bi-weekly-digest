"use client"

import { DashboardCard, CardHeader, CardContent } from '@/components/dashboard-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronRight, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'

interface StockInputProps {
  stockTicker: string
  onTickerChange: (ticker: string) => void
  onAnalyze: () => void
  analyzing: boolean
  disabled: boolean
}

const POPULAR_STOCKS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'BRK.B']

export function StockInput({ 
  stockTicker, 
  onTickerChange, 
  onAnalyze, 
  analyzing, 
  disabled 
}: StockInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <DashboardCard variant="default" padding="medium">
        <CardHeader
          title="Stock Ticker"
          subtitle="Enter a symbol to analyze"
          icon={<Search className="h-5 w-5 text-foreground" />}
        />
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., AAPL"
                value={stockTicker}
                onChange={(e) => onTickerChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && !disabled && onAnalyze()}
                className="font-mono text-lg"
              />
              <Button 
                onClick={onAnalyze}
                disabled={disabled || analyzing}
                size="lg"
                className="rounded-full px-6"
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Analyze
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Popular Stocks Grid */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">Popular stocks</p>
              <div className="grid grid-cols-4 gap-2">
                {POPULAR_STOCKS.map(ticker => (
                  <button
                    key={ticker}
                    onClick={() => onTickerChange(ticker)}
                    className="p-2.5 rounded-xl bg-background/50 hover:bg-muted/50 text-sm font-mono font-medium transition-all hover:scale-105"
                  >
                    {ticker}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </DashboardCard>
    </motion.div>
  )
}