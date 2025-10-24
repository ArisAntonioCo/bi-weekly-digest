'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Banner } from '@/components/ui/banner'
import Link from 'next/link'
import { useBanner } from '@/contexts/banner-context'

export function FreemiumBanner() {
  const { isVisible, hideBanner, setBannerHeight } = useBanner()
  const bannerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Only show on home page
  const isHomePage = pathname === '/'

  // Measure and update banner height when it changes
  useEffect(() => {
    if (!isHomePage || !isVisible) {
      setBannerHeight(0)
      return
    }

    if (!bannerRef.current) {
      return
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        setBannerHeight(height)
      }
    })

    resizeObserver.observe(bannerRef.current)

    return () => {
      resizeObserver.disconnect()
      setBannerHeight(0)
    }
  }, [isHomePage, isVisible, setBannerHeight])

  const handleClose = () => {
    hideBanner()
  }

  if (!isVisible || !isHomePage) return null

  return (
    <div 
      ref={bannerRef}
      className="freemium-banner fixed top-0 left-0 right-0 z-[60] w-full"
    >
      <Banner
        variant="default"
        size="sm"
        onClose={handleClose}
        isClosable
        className="rounded-none border-0 bg-black text-white py-2"
      >
        <div className="flex w-full flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-center">
          <span className="text-xs font-medium text-white/80 sm:text-sm">
            Contribute to 3YMode’s open-source platform — help ship new investment tools.
          </span>
          <Link
            href="https://github.com/ArisAntonioCo/bi-weekly-digest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-white underline decoration-white/60 underline-offset-4 transition-colors hover:decoration-white sm:text-sm"
          >
            GitHub →
          </Link>
        </div>
      </Banner>
    </div>
  )
}
