"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Hold, parseAnalysisParams } from '@/utils/query-params'

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

// One-way sync: URL -> store (page code is free to push URL when needed)
export function AnalysisUrlSync() {
  const sp = useSearchParams()
  const { setExperts, setTicker, setHold } = useAnalysisStore()

  useEffect(() => {
    const p = parseAnalysisParams(sp)
    if (p.experts) setExperts(p.experts)
    if (p.ticker) setTicker(p.ticker)
    if (p.hold) setHold(p.hold)
  }, [sp, setExperts, setTicker, setHold])

  return null
}
