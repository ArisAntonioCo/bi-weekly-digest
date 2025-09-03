"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Hold, AnalysisParams, parseAnalysisParams, analysisParamsToQuery } from '@/utils/query-params'

type AnalysisState = {
  selectedExperts: string[]
  ticker: string
  hold: Hold
  panelOpen: boolean
  setExperts: (ids: string[]) => void
  setTicker: (v: string) => void
  setHold: (v: Hold) => void
  setPanelOpen: (v: boolean) => void
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      selectedExperts: [],
      ticker: '',
      hold: 3,
      panelOpen: true,
      setExperts: (ids) => set({ selectedExperts: ids }),
      setTicker: (v) => set({ ticker: v.toUpperCase() }),
      setHold: (v) => set({ hold: v }),
      setPanelOpen: (v) => set({ panelOpen: v }),
    }),
    { name: 'analysis-ui' }
  )
)

export function AnalysisUrlSync() {
  const router = useRouter()
  const sp = useSearchParams()
  const params = parseAnalysisParams(sp)
  const { selectedExperts, ticker, hold, setExperts, setTicker, setHold } = useAnalysisStore()

  // Hydrate from URL on mount
  useEffect(() => {
    if (params.experts) setExperts(params.experts)
    if (params.ticker) setTicker(params.ticker)
    if (params.hold) setHold(params.hold)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push URL when core params change
  useEffect(() => {
    const current: AnalysisParams = parseAnalysisParams(sp)
    const next: AnalysisParams = {
      experts: selectedExperts.length ? selectedExperts : undefined,
      ticker: ticker || undefined,
      hold,
    }
    if (
      (current.ticker || '') === (next.ticker || '') &&
      (current.hold || 3) === (next.hold || 3) &&
      (current.experts || []).join(',') === (next.experts || []).join(',')
    ) {
      return
    }
    const q = analysisParamsToQuery(next)
    const url = q ? `/expert-analysis?${q}` : '/expert-analysis'
    router.replace(url)
  }, [selectedExperts, ticker, hold, router, sp])

  return null
}

