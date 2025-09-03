"use client"

import { DashboardCard, CardHeader, CardContent } from '@/components/dashboard-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronRight, Loader2, TrendingUp, Landmark } from 'lucide-react'
import { motion } from 'motion/react'
import { HoldPeriodSelector } from './hold-period-selector'

interface StockInputProps {
  stockTicker: string
  onTickerChange: (ticker: string) => void
  onAnalyze: () => void
  analyzing: boolean
  disabled: boolean
  holdPeriod: 3 | 5 | 10
  onHoldPeriodChange: (value: 3 | 5 | 10) => void
  expertCount: number
}

interface TickerOption {
  symbol: string
  type: 'stock' | 'etf'
}

const POPULAR_TICKERS: TickerOption[] = [
  { symbol: 'AAPL', type: 'stock' },
  { symbol: 'SPY', type: 'etf' },
  { symbol: 'NVDA', type: 'stock' },
  { symbol: 'QQQ', type: 'etf' },
  { symbol: 'MSFT', type: 'stock' },
  { symbol: 'VOO', type: 'etf' },
  { symbol: 'GOOGL', type: 'stock' },
  { symbol: 'IWM', type: 'etf' },
]

const validateTicker = (ticker: string): boolean => {
  const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/
  return tickerRegex.test(ticker)
}

export function StockInput({ 
  stockTicker, 
  onTickerChange, 
  onAnalyze, 
  analyzing, 
  disabled,
  holdPeriod,
  onHoldPeriodChange,
  expertCount
}: StockInputProps) {
  const handleTickerChange = (value: string) => {
    const upperCaseValue = value.toUpperCase()
    onTickerChange(upperCaseValue)
  }

  const handleAnalyzeClick = () => {
    if (!validateTicker(stockTicker)) {
      return
    }
    onAnalyze()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && validateTicker(stockTicker)) {
      onAnalyze()
    }
  }

  const isValidInput = stockTicker.length === 0 || validateTicker(stockTicker)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardCard variant="default" padding="medium">
        <CardHeader
          title="Stock or ETF Symbol"
          subtitle="Enter a ticker and choose your hold period"
          icon={<Search className="h-5 w-5 text-foreground" />}
        />
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g., AAPL or SPY"
                  value={stockTicker}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`font-mono text-lg h-11 rounded-full px-5 ${
                    !isValidInput ? 'border-destructive focus:ring-destructive' : ''
                  }`}
                  aria-invalid={!isValidInput}
                  aria-describedby={!isValidInput ? 'ticker-error' : undefined}
                />
                {!isValidInput && (
                  <p id="ticker-error" className="text-xs text-destructive mt-1 ml-3">
                    Invalid format. Use 1-5 letters (e.g., AAPL, SPY)
                  </p>
                )}
              </div>
              <Button 
                onClick={handleAnalyzeClick}
                disabled={disabled || analyzing || !isValidInput}
                size="lg"
                className="rounded-full px-8 h-11 min-w-[120px]"
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

            {/* Hold Period Selector */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">Hold Period</p>
                <HoldPeriodSelector 
                  value={holdPeriod} 
                  onChange={onHoldPeriodChange}
                  disabled={analyzing}
                />
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Experts selected: {expertCount}</p>
                <p className={expertCount >= 3 && expertCount <= 5 ? '' : 'text-destructive'}>Choose 3–5 experts</p>
              </div>
            </div>

            {/* Popular Tickers Grid */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">Popular stocks & ETFs</p>
              <div className="grid grid-cols-4 gap-2">
                {POPULAR_TICKERS.map(({ symbol, type }) => (
                  <button
                    key={symbol}
                    onClick={() => handleTickerChange(symbol)}
                    className="group relative p-2.5 rounded-xl bg-background/50 hover:bg-muted/50 text-sm font-mono font-medium transition-all hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-1">
                      {type === 'etf' ? (
                        <Landmark className="h-3 w-3 opacity-60" />
                      ) : (
                        <TrendingUp className="h-3 w-3 opacity-60" />
                      )}
                      {symbol}
                    </span>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                      {type === 'etf' ? 'ETF' : 'Stock'}
                    </span>
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
