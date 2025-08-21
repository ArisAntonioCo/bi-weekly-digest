"use client"

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Expert } from '@/types/expert'
import { toast } from 'sonner'
import { useActiveExperts } from '@/hooks/use-active-experts'

// Import components
import { PageHeader } from '../_components/page-header'
import { ExpertSelector } from '../_components/expert-selector'
import { StockInput } from '../_components/stock-input'
import { LoadingState } from '../_components/loading-state'
import { AnalysisResult } from '../_components/analysis-result'
import { EmptyState } from '../_components/empty-state'
import { DisclaimerDialog } from '../_components/disclaimer-dialog'

interface AnalysisResultType {
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

export function ExpertAnalysisPage() {
  const { experts, isLoading: loadingExperts, isError, refresh } = useActiveExperts()
  const [selectedExperts, setSelectedExperts] = useState<Expert[]>([])
  const [stockTicker, setStockTicker] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResultType[]>([])
  const [showDisclaimer, setShowDisclaimer] = useState(true)

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

  const saveToRecent = (analysis: AnalysisResultType) => {
    // Only save valid analysis results
    if (!analysis || !analysis.stock_ticker || !analysis.expert_name || !analysis.id) {
      console.warn('Attempted to save invalid analysis result')
      return
    }
    const updated = [analysis, ...recentAnalyses.slice(0, 4)]
    setRecentAnalyses(updated)
    localStorage.setItem('recentAnalyses', JSON.stringify(updated))
  }

  const removeExpert = (expertToRemove: Expert) => {
    setSelectedExperts(prev => prev.filter(e => e.id !== expertToRemove.id))
  }

  const handleAnalyze = async () => {
    if (selectedExperts.length === 0) {
      toast.error('Please select at least one expert')
      return
    }

    if (!stockTicker.trim()) {
      toast.error('Please enter a stock or ETF ticker')
      return
    }

    try {
      setAnalyzing(true)
      setAnalysisResult(null)

      // For now, use the first expert for the API call
      // Later this can be enhanced to combine multiple expert perspectives
      const expertsToUse = selectedExperts.length === 1 
        ? selectedExperts[0] 
        : selectedExperts[0] // TODO: Implement multi-expert analysis

      const response = await fetch('/api/expert-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expert_id: expertsToUse.id,
          stock_ticker: stockTicker.toUpperCase().trim(),
          // For future: pass all expert IDs
          expert_ids: selectedExperts.map(e => e.id)
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      // Update expert name to show multiple if applicable
      if (selectedExperts.length > 1) {
        result.data.expert_name = selectedExperts.map(e => e.name).join(', ')
      }
      
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

  if (loadingExperts) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64 mx-auto" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-4">
                <Skeleton className="h-[500px] w-full rounded-3xl" />
                <Skeleton className="h-[200px] w-full rounded-3xl" />
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-[600px] w-full rounded-3xl" />
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
                onSelectExperts={setSelectedExperts}
              />
            </div>

            {/* Right Column - Stock Input & Analysis Results */}
            <div className="lg:col-span-2 space-y-4">
              <StockInput
                stockTicker={stockTicker}
                onTickerChange={setStockTicker}
                onAnalyze={handleAnalyze}
                analyzing={analyzing}
                disabled={selectedExperts.length === 0 || !stockTicker}
              />
              
              {/* Analysis Display */}
              {analyzing ? (
                <LoadingState 
                  stockTicker={stockTicker}
                  selectedExperts={selectedExperts}
                />
              ) : analysisResult ? (
                <AnalysisResult 
                  result={analysisResult}
                  selectedExpert={selectedExperts[0]} // For compatibility
                />
              ) : (
                <EmptyState 
                  selectedExperts={selectedExperts}
                  onRemoveExpert={removeExpert}
                  recentAnalyses={recentAnalyses}
                  onSelectAnalysis={setAnalysisResult}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}