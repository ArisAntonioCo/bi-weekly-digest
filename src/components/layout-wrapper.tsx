'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface LayoutWrapperProps {
  children: ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Check if current page is auth or admin page
  const isAuthPage = ['/login', '/signup'].includes(pathname)
  const isAdminPage = pathname.startsWith('/admin')
  const shouldHaveNavbar = !isAuthPage && !isAdminPage
  
  return (
    <div className={shouldHaveNavbar ? 'pt-16' : ''}>
      {children}
    </div>
  )
}