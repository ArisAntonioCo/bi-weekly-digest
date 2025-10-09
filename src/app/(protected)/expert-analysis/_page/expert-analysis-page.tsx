"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Expert } from '@/types/expert'
import { toast } from 'sonner'
import { useActiveExperts } from '@/hooks/use-active-experts'
import { AnimatePresence } from 'motion/react'

// Import components
import { PageHeader } from '../_components/page-header'
import { ExpertSelector } from '../_components/expert-selector'
import { StockInput } from '../_components/stock-input'
import { LoadingState } from '../_components/loading-state'
import { AnalysisResult } from '../_components/analysis-result'
import { EmptyState } from '../_components/empty-state'
import { DisclaimerDialog } from '../_components/disclaimer-dialog'
import type { HoldPeriod } from '../_components/hold-period-selector'

interface AnalysisResultType {
  id: string
  stock_ticker: string
  company_name: string
  expert_name: string
  expert_id: string
  expert_ids?: string[]
  analysis: string
  timestamp: string
  current_price?: number
  market_cap?: string
  pe_ratio?: number
  hold_period?: number
}

type EnrichedResult = AnalysisResultType & { expertIds: string[] }

const mapIdsToExperts = (allExperts: Expert[], ids: string[]): Expert[] => {
  if (!ids.length) return []
  const byId = new Map(allExperts.map((expert) => [expert.id, expert]))
  return ids
    .map((id) => byId.get(id))
    .filter((expert): expert is Expert => Boolean(expert))
}

export function ExpertAnalysisPage() {
  const { experts, isLoading: loadingExperts, isValidating, isError, refresh } = useActiveExperts()

  const [selectedExperts, setSelectedExperts] = useState<Expert[]>([])
  const [stockTicker, setStockTicker] = useState('')
  const [holdPeriod, setHoldPeriod] = useState<HoldPeriod>(3)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<EnrichedResult | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResultType[]>([])
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [includeFedPolicy, setIncludeFedPolicy] = useState(true)
  const [includeMarketSentiment, setIncludeMarketSentiment] = useState(true)

  const abortRef = useRef<AbortController | null>(null)

  const selectedExpertIds = useMemo(() => selectedExperts.map((expert) => expert.id), [selectedExperts])

  const analysisExperts = useMemo(() => {
    if (!analysisResult) return []
    return mapIdsToExperts(experts || [], analysisResult.expertIds)
  }, [analysisResult, experts])

  useEffect(() => {
    loadRecentAnalyses()
  }, [])

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load experts. Please try again.', {
        action: {
          label: 'Retry',
          onClick: () => refresh()
        }
      })
    }
  }, [isError, refresh])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const loadRecentAnalyses = () => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('recentAnalyses')
    if (!stored) {
      setRecentAnalyses([])
      return
    }

    try {
      const parsed = JSON.parse(stored)
      const validAnalyses = Array.isArray(parsed)
        ? parsed.filter(item => item && item.stock_ticker && item.expert_name && item.id)
        : []
      setRecentAnalyses(validAnalyses)
    } catch (error) {
      console.error('Failed to parse recent analyses:', error)
      setRecentAnalyses([])
    }
  }

  const saveToRecent = (analysis: AnalysisResultType) => {
    if (!analysis || !analysis.stock_ticker || !analysis.expert_name || !analysis.id) {
      console.warn('Attempted to save invalid analysis result')
      return
    }

    const withHorizon: AnalysisResultType = {
      ...analysis,
      hold_period: analysis.hold_period ?? holdPeriod,
      expert_ids: analysis.expert_ids ?? selectedExpertIds
    }

    const updated = [withHorizon, ...recentAnalyses.slice(0, 4)]
    setRecentAnalyses(updated)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('recentAnalyses', JSON.stringify(updated))
    }
  }

  const removeExpert = (expertToRemove: Expert) => {
    setSelectedExperts(prev => prev.filter(expert => expert.id !== expertToRemove.id))
  }

  const handleExpertsChange = (expertsList: Expert[]) => {
    setSelectedExperts(expertsList)
  }

  const handleStartAgain = () => {
    setAnalysisResult(null)
    setStockTicker('')
    // Keep selected experts for convenience
  }

  const handleSelectRecentAnalysis = (analysis: AnalysisResultType | null) => {
    if (!analysis) {
      setAnalysisResult(null)
      return
    }

    if (analysis.expert_ids && experts?.length) {
      setSelectedExperts(mapIdsToExperts(experts, analysis.expert_ids))
    }

    if (analysis.hold_period && [3, 5, 10].includes(analysis.hold_period)) {
      setHoldPeriod(analysis.hold_period as HoldPeriod)
    }

    if (analysis.stock_ticker) {
      setStockTicker(analysis.stock_ticker)
    }

    const enriched: EnrichedResult = {
      ...analysis,
      expertIds: analysis.expert_ids ?? selectedExpertIds
    }

    setAnalysisResult(enriched)
  }

  const handleAnalyze = async () => {
    if (selectedExperts.length === 0) {
      toast.error('Please select at least one expert')
      return
    }

    if (selectedExperts.length < 3 || selectedExperts.length > 5) {
      toast.error('Please select between 3 and 5 experts')
      return
    }

    if (!stockTicker.trim()) {
      toast.error('Please enter a stock or ETF ticker')
      return
    }

    try {
      setAnalyzing(true)
      setAnalysisResult(null)
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const response = await fetch('/api/expert-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expert_id: selectedExperts[0].id,
          stock_ticker: stockTicker.toUpperCase().trim(),
          expert_ids: selectedExpertIds,
          hold_period: holdPeriod,
          include_fed_policy: includeFedPolicy,
          include_market_sentiment: includeMarketSentiment
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()

      if (selectedExperts.length > 1) {
        result.data.expert_name = selectedExperts.map(e => e.name).join(', ')
        result.data.expert_id = 'multiple'
      }

      const enriched: EnrichedResult = {
        ...result.data,
        expert_ids: [...selectedExpertIds],
        expertIds: [...selectedExpertIds]
      }

      setAnalysisResult(enriched)
      saveToRecent(enriched)
      toast.success('Analysis complete!')
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        return
      }
      console.error('Analysis error:', error)
      toast.error('Failed to analyze stock. Please try again.')
    } finally {
      setAnalyzing(false)
      abortRef.current = null
    }
  }

  if (loadingExperts) {
    return (
      <div className="min-h-screen bg-background">
        {/* Page Header - Exact match to PageHeader component */}
        <div className="container mx-auto px-4 pt-6 pb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
        
        {/* Main Content - Exact grid structure */}
        <div className="container mx-auto px-4 pb-12">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Column - Expert Selector Card */}
            <div>
              {/* Using DashboardCard structure with bg-muted/50 */}
              <div className="bg-muted/50 rounded-3xl p-6 min-h-[200px]">
                {/* CardHeader structure */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <Skeleton className="h-5 w-5" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* CardContent with mt-4 */}
                <div className="mt-4">
                  {/* Search and Sort Controls */}
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-10 flex-1 rounded-md" />
                    <Skeleton className="h-10 w-[140px] rounded-md" />
                  </div>
                  
                  {/* ScrollArea with expert cards */}
                  <div className="h-[calc(100vh-380px)] pr-3">
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-background/50">
                          <div className="relative">
                            {/* Selection indicator position */}
                            <div className="absolute right-4 top-4">
                              <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                            {/* Expert info */}
                            <div className="pr-10 space-y-2">
                              <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                <div>
                                  <Skeleton className="h-5 w-32 mb-1" />
                                  <Skeleton className="h-3 w-24" />
                                </div>
                              </div>
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-4/5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stock Input & Empty State */}
            <div className="lg:col-span-2 space-y-4">
              {/* Stock Input Card - DashboardCard structure */}
              <div className="bg-muted/50 rounded-3xl p-6 min-h-[200px]">
                {/* CardHeader */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <Skeleton className="h-5 w-5" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-4 w-56" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* CardContent */}
                <div className="mt-4">
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-md" />
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-9 rounded-lg" />
                      ))}
                    </div>
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                </div>
              </div>
              
              {/* Empty State Card */}
              <div className="bg-muted/50 rounded-3xl p-8 min-h-[200px]">
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <DisclaimerDialog 
        open={showDisclaimer} 
        onAccept={() => setShowDisclaimer(false)} 
      />
      
      <div className="min-h-screen bg-background">
        <PageHeader />
        
        <div className="container mx-auto px-4 pb-12">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Column - Expert Selection */}
            <div>
              <ExpertSelector 
                experts={experts}
                selectedExperts={selectedExperts}
                onSelectExperts={handleExpertsChange}
                loading={loadingExperts || isValidating}
              />
            </div>

            {/* Right Column - Stock Input & Analysis Results */}
            <div className="lg:col-span-2 space-y-4">
              {/* Stock Input with Animation */}
              <AnimatePresence mode="wait">
                {!analysisResult && (
                <StockInput
                  key="stock-input"
                  stockTicker={stockTicker}
                  onTickerChange={setStockTicker}
                  onAnalyze={handleAnalyze}
                  analyzing={analyzing}
                  disabled={
                    !stockTicker || analyzing || selectedExperts.length < 3 || selectedExperts.length > 5
                  }
                  holdPeriod={holdPeriod}
                  onHoldPeriodChange={setHoldPeriod}
                  expertCount={selectedExperts.length}
                  includeFedPolicy={includeFedPolicy}
                  onIncludeFedPolicyChange={setIncludeFedPolicy}
                  includeMarketSentiment={includeMarketSentiment}
                  onIncludeMarketSentimentChange={setIncludeMarketSentiment}
                />
                )}
              </AnimatePresence>
              
              {/* Analysis Display */}
              <AnimatePresence mode="wait">
                {analyzing ? (
                  <LoadingState 
                    key="loading"
                    stockTicker={stockTicker}
                    selectedExperts={selectedExperts}
                  />
                ) : analysisResult ? (
                  <AnalysisResult 
                    key="result"
                    result={analysisResult}
                    expertsUsed={analysisExperts}
                    onStartAgain={handleStartAgain}
                  />
                ) : !analysisResult && (
                  <EmptyState 
                    key="empty"
                    selectedExperts={selectedExperts}
                    onRemoveExpert={removeExpert}
                    recentAnalyses={recentAnalyses}
                    onSelectAnalysis={handleSelectRecentAnalysis}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
