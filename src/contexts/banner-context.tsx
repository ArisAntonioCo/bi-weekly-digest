'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'

interface BannerContextValue {
  isVisible: boolean
  bannerHeight: number
  showBanner: () => void
  hideBanner: () => void
  setBannerHeight: (height: number) => void
}

const BannerContext = createContext<BannerContextValue | undefined>(undefined)

interface BannerProviderProps {
  children: ReactNode
}

export function BannerProvider({ children }: BannerProviderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [bannerHeight, setBannerHeight] = useState(0)

  const showBanner = useCallback(() => {
    setIsVisible(true)
  }, [])

  const hideBanner = useCallback(() => {
    setIsVisible(false)
    setBannerHeight(0)
  }, [])

  const updateBannerHeight = useCallback((height: number) => {
    setBannerHeight(height)
  }, [])

  const value: BannerContextValue = useMemo(() => ({
    isVisible,
    bannerHeight,
    showBanner,
    hideBanner,
    setBannerHeight: updateBannerHeight
  }), [isVisible, bannerHeight, showBanner, hideBanner, updateBannerHeight])

  return (
    <BannerContext.Provider value={value}>
      {children}
    </BannerContext.Provider>
  )
}

export function useBanner() {
  const context = useContext(BannerContext)
  if (context === undefined) {
    throw new Error('useBanner must be used within a BannerProvider')
  }
  return context
}