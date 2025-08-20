"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Search,
  TrendingUp,
  Sparkles,
  User,
  AlertCircle,
  Loader2,
  ChevronRight,
  Building2,
  DollarSign,
  Zap,
  Info,
  Target,
  Brain,
  LineChart,
  Shield,
  Briefcase
} from 'lucide-react'
import { Expert } from '@/types/expert'
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

// Helper function to get category icon
function getCategoryIcon(category?: string) {
  switch (category) {
    case 'value':
      return <Shield className="h-3 w-3" />
    case 'growth':
      return <TrendingUp className="h-3 w-3" />
    case 'tech':
      return <Brain className="h-3 w-3" />
    case 'macro':
      return <LineChart className="h-3 w-3" />
    default:
      return <Briefcase className="h-3 w-3" />
  }
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

export function ExpertAnalysisPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [stockTicker, setStockTicker] = useState('')
  const [loadingExperts, setLoadingExperts] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([])

  useEffect(() => {
    loadExperts()
    loadRecentAnalyses()
  }, [])

  const loadExperts = async () => {
    try {
      setLoadingExperts(true)
      const response = await fetch('/api/experts?active=true')
      if (response.ok) {
        const data = await response.json()
        setExperts(data.experts || [])
        // Select first expert by default
        if (data.experts && data.experts.length > 0) {
          setSelectedExpert(data.experts[0])
        }
      }
    } catch (error) {
      console.error('Failed to load experts:', error)
      toast.error('Failed to load experts')
    } finally {
      setLoadingExperts(false)
    }
  }

  const loadRecentAnalyses = () => {
    // Load from localStorage for now
    const stored = localStorage.getItem('recentAnalyses')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Filter out any null or invalid entries
        const validAnalyses = Array.isArray(parsed) 
          ? parsed.filter(item => item && item.stock_ticker && item.expert_name && item.id)
          : []
        setRecentAnalyses(validAnalyses)
      } catch (error) {
        console.error('Failed to parse recent analyses:', error)
        setRecentAnalyses([])
      }
    }
  }

  const saveToRecent = (analysis: AnalysisResult) => {
    // Only save valid analysis results
    if (!analysis || !analysis.stock_ticker || !analysis.expert_name || !analysis.id) {
      console.warn('Attempted to save invalid analysis result')
      return
    }
    const updated = [analysis, ...recentAnalyses.slice(0, 4)]
    setRecentAnalyses(updated)
    localStorage.setItem('recentAnalyses', JSON.stringify(updated))
  }

  const handleAnalyze = async () => {
    if (!selectedExpert) {
      toast.error('Please select an expert')
      return
    }

    if (!stockTicker.trim()) {
      toast.error('Please enter a stock ticker')
      return
    }

    try {
      setAnalyzing(true)
      setAnalysisResult(null)

      const response = await fetch('/api/expert-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expert_id: selectedExpert.id,
          stock_ticker: stockTicker.toUpperCase().trim()
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysisResult(result.data)
      saveToRecent(result.data)
      toast.success('Analysis complete!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze stock. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleQuickAnalyze = (ticker: string) => {
    setStockTicker(ticker)
    handleAnalyze()
  }

  const popularStocks = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'BRK.B']

  if (loadingExperts) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expert Stock Analysis</h1>
            <p className="text-muted-foreground">
              Get AI-powered stock analysis through the lens of legendary investors
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Expert Selection & Input */}
        <div className="lg:col-span-1 space-y-6">
          {/* Expert Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Expert Framework
              </CardTitle>
              <CardDescription>
                Choose an investment expert's perspective for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={experts[0]?.category || 'all'} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="value">Value</TabsTrigger>
                  <TabsTrigger value="growth">Growth</TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-[300px] mt-4">
                  <TooltipProvider>
                    {['all', 'value', 'growth'].map(category => (
                      <TabsContent key={category} value={category} className="mt-0 space-y-2">
                        {experts
                          .filter(e => category === 'all' || e.category === category)
                          .map(expert => (
                            <Tooltip key={expert.id}>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={() => setSelectedExpert(expert)}
                                  className={`p-3 rounded-lg border cursor-pointer transition-all relative ${
                                    selectedExpert?.id === expert.id 
                                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                                      : 'border-border hover:border-primary/50 hover:shadow-sm'
                                  }`}
                                >
                                  {/* Selected Indicator */}
                                  {selectedExpert?.id === expert.id && (
                                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
                                  )}
                                  
                                  {/* Expert Info */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="font-medium flex items-center gap-2">
                                        {expert.name}
                                        {expert.category && (
                                          <Badge 
                                            variant="outline" 
                                            className={`text-[10px] px-1.5 py-0 h-4 ${getCategoryColor(expert.category)}`}
                                          >
                                            <span className="flex items-center gap-0.5">
                                              {getCategoryIcon(expert.category)}
                                              {expert.category.toUpperCase()}
                                            </span>
                                          </Badge>
                                        )}
                                      </div>
                                      {expert.title && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {expert.title}
                                        </div>
                                      )}
                                      <div className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                                        "{expert.investing_law}"
                                      </div>
                                    </div>
                                    {selectedExpert?.id === expert.id && (
                                      <Target className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                                    )}
                                  </div>
                                  
                                  {/* Focus Areas Tags */}
                                  {expert.focus_areas && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {expert.focus_areas.split(',').slice(0, 3).map((area, idx) => (
                                        <span 
                                          key={idx} 
                                          className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full"
                                        >
                                          {area.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-sm">
                                <div className="space-y-2">
                                  <p className="font-semibold">{expert.name}'s Framework</p>
                                  {expert.framework_description && (
                                    <p className="text-xs">{expert.framework_description}</p>
                                  )}
                                  {expert.focus_areas && (
                                    <div>
                                      <p className="text-xs font-medium mb-1">Focus Areas:</p>
                                      <p className="text-xs text-muted-foreground">{expert.focus_areas}</p>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                      </TabsContent>
                    ))}
                  </TooltipProvider>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>

          {/* Selected Expert Summary */}
          {selectedExpert && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Selected Framework
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{selectedExpert.name}</span>
                  {selectedExpert.category && (
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${getCategoryColor(selectedExpert.category)}`}
                    >
                      {selectedExpert.category.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  "{selectedExpert.investing_law}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stock Input */}
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
                  onChange={(e) => setStockTicker(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  className="font-mono"
                />
                <Button 
                  onClick={handleAnalyze}
                  disabled={!selectedExpert || !stockTicker || analyzing}
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
                  {popularStocks.map(ticker => (
                    <Badge
                      key={ticker}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setStockTicker(ticker)}
                    >
                      {ticker}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analysis Results */}
        <div className="lg:col-span-2">
          {analyzing ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getCategoryIcon(selectedExpert?.category)}
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium">
                      Analyzing {stockTicker}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Applying {selectedExpert?.name}'s investment framework
                    </p>
                    {selectedExpert?.category && (
                      <Badge 
                        variant="outline" 
                        className={`${getCategoryColor(selectedExpert.category)}`}
                      >
                        {selectedExpert.category.toUpperCase()} ANALYSIS
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : analysisResult ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Building2 className="h-6 w-6" />
                      {analysisResult.company_name || analysisResult.stock_ticker}
                    </CardTitle>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{analysisResult.expert_name}</span>
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
                    {analysisResult.stock_ticker}
                  </Badge>
                </div>

                {/* Stock Metrics */}
                {analysisResult.current_price && (
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">${analysisResult.current_price}</span>
                    </div>
                    {analysisResult.market_cap && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Market Cap: {analysisResult.market_cap}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap">{analysisResult.analysis}</div>
                  </div>
                </ScrollArea>
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>Generated {new Date(analysisResult.timestamp).toLocaleString()}</span>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(analysisResult.analysis)}>
                    Copy Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
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
                              onClick={() => setAnalysisResult(analysis)}
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
          )}
        </div>
      </div>

      {/* Info Section */}
      <Alert className="mt-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Each expert framework provides unique insights based on their investment philosophy. 
          The analysis combines real-time market data with the expert's proven investment principles 
          to deliver actionable insights.
        </AlertDescription>
      </Alert>
    </div>
  )
}