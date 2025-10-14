'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
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
    if (isHomePage && isVisible && bannerRef.current) {
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
    } else {
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
        className="rounded-none border-0 bg-black text-white"
        action={
          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-black hover:bg-gray-200 h-12 px-7 text-base sm:text-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        }
      >
        <div className="text-center sm:text-left">
          <span className="text-sm">
            <span className="font-semibold">Limited free offer.</span>
            {' '}Get AI-powered investment insights with our newsletter.
          </span>
        </div>
      </Banner>
    </div>
  )
}
