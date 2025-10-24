'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { useBanner } from '@/contexts/banner-context'

interface LayoutWrapperProps {
  children: ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const { bannerHeight } = useBanner()
  
  // Check if current page is auth or admin page
  const isAuthPage = ['/login', '/signup'].includes(pathname)
  const isAdminPage = pathname.startsWith('/admin')
  const shouldHaveNavbar = !isAuthPage && !isAdminPage
  const NAVBAR_BASE_HEIGHT = 64 // matches previous pt-16 offset
  
  const paddingTop = shouldHaveNavbar ? NAVBAR_BASE_HEIGHT + bannerHeight : 0
  
  return shouldHaveNavbar ? (
    <div style={{ paddingTop }}>
      {children}
    </div>
  ) : (
    <>{children}</>
  )
}
