"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronRight, Loader2 } from 'lucide-react'

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Enter Stock Ticker
        </CardTitle>
        <CardDescription>
          Type a stock symbol to analyze
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="e.g., AAPL, NVDA, TSLA"
            value={stockTicker}
            onChange={(e) => onTickerChange(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && !disabled && onAnalyze()}
            className="font-mono"
          />
          <Button 
            onClick={onAnalyze}
            disabled={disabled || analyzing}
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Popular Stocks */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Popular stocks:</p>
          <div className="flex flex-wrap gap-1">
            {POPULAR_STOCKS.map(ticker => (
              <Badge
                key={ticker}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onTickerChange(ticker)}
              >
                {ticker}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}