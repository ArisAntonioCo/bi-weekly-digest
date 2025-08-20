"use client"

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Expert } from '@/types/expert'
import { toast } from 'sonner'

// Import components
import { PageHeader } from '../_components/page-header'
import { ExpertSelector } from '../_components/expert-selector'
import { StockInput } from '../_components/stock-input'
import { LoadingState } from '../_components/loading-state'
import { AnalysisResult } from '../_components/analysis-result'
import { EmptyState } from '../_components/empty-state'

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
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [stockTicker, setStockTicker] = useState('')
  const [loadingExperts, setLoadingExperts] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResultType[]>([])

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

  if (loadingExperts) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64 mx-auto" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-4">
                <Skeleton className="h-[400px] w-full rounded-3xl" />
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
    <div className="min-h-screen bg-background">
      <PageHeader />
      
      <div className="container mx-auto px-4 max-w-6xl pb-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Expert Selection & Input */}
          <div className="lg:col-span-1 space-y-4">
            <ExpertSelector 
              experts={experts}
              selectedExpert={selectedExpert}
              onSelectExpert={setSelectedExpert}
            />
            
            <StockInput
              stockTicker={stockTicker}
              onTickerChange={setStockTicker}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
              disabled={!selectedExpert || !stockTicker}
            />
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            {analyzing ? (
              <LoadingState 
                stockTicker={stockTicker}
                selectedExpert={selectedExpert}
              />
            ) : analysisResult ? (
              <AnalysisResult 
                result={analysisResult}
                selectedExpert={selectedExpert}
              />
            ) : (
              <EmptyState 
                recentAnalyses={recentAnalyses}
                onSelectAnalysis={setAnalysisResult}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}