'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function FreemiumBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [bannerHeight, setBannerHeight] = useState(0)
  const pathname = usePathname()
  
  // Only show on home page
  const isHomePage = pathname === '/'

  useEffect(() => {
    if (isHomePage && isVisible) {
      // Measure the banner height and apply it to the navbar
      const banner = document.querySelector('.freemium-banner')
      if (banner) {
        const height = banner.getBoundingClientRect().height
        setBannerHeight(height)
        // Push the navbar down by the banner height
        const navbar = document.querySelector('nav')
        if (navbar) {
          navbar.style.top = `${height}px`
        }
      }
    } else {
      // Reset navbar position when banner is not visible
      const navbar = document.querySelector('nav')
      if (navbar) {
        navbar.style.top = '0px'
      }
    }

    return () => {
      // Clean up navbar position
      const navbar = document.querySelector('nav')
      if (navbar) {
        navbar.style.top = '0px'
      }
    }
  }, [isHomePage, isVisible])

  const handleClose = () => {
    setIsVisible(false)
    // Reset navbar position when banner is closed
    const navbar = document.querySelector('nav')
    if (navbar) {
      navbar.style.top = '0px'
    }
  }

  if (!isVisible || !isHomePage) return null

  return (
    <div className="freemium-banner fixed top-0 left-0 right-0 z-[60] w-full">
      <Banner
        variant="default"
        size="sm"
        onClose={handleClose}
        isClosable
        className="rounded-none border-0 bg-black text-white"
      action={
        <Link href="/signup">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-black hover:bg-gray-200"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-3 w-3" />
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