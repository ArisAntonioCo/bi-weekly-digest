'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  LogOut, 
  LayoutDashboard, 
  BookOpen,
  ChevronDown,
  TrendingUp
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { Logo } from '@/components/ui/logo'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

interface NavbarProps {
  className?: string
}

export default function Navbar({ className }: NavbarProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  
  const { scrollY } = useScroll()
  
  // Handle scroll direction for show/hide behavior
  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest
    
    // Don't hide navbar if we're near the top
    if (currentScrollY < 100) {
      setIsVisible(true)
      setLastScrollY(currentScrollY)
      return
    }
    
    // Determine scroll direction
    if (currentScrollY < lastScrollY) {
      // Scrolling up - show navbar
      setIsVisible(true)
    } else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 10) {
      // Scrolling down with threshold - hide navbar
      setIsVisible(false)
    }
    
    setLastScrollY(currentScrollY)
  })

  useEffect(() => {
    const supabase = createClient()
    
    // Check initial auth state
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking auth state:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Check auth state when pathname changes (e.g., after login redirect)
  useEffect(() => {
    // Only check on specific route changes that matter
    if (pathname === '/dashboard' || pathname === '/admin/dashboard' || pathname === '/') {
      const checkAuthOnRouteChange = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      }
      
      checkAuthOnRouteChange()
    }
  }, [pathname])

  // Memoized handlers
  const handleSignOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    
    // Reset theme to default on logout
    localStorage.removeItem('bi-weekly-digest-theme')
    document.documentElement.classList.remove('dark')
    
    router.push('/login')
  }, [router])

  const handleNavigation = useCallback((path: string) => {
    router.push(path)
  }, [router])

  // Extract user initials for avatar
  const getUserInitials = useCallback((email: string): string => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }, [])

  // Check if current route is active
  const isActiveRoute = useCallback((route: string): boolean => {
    if (route === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (route === '/blogs') {
      return pathname.startsWith('/blogs')
    }
    if (route === '/expert-analysis') {
      return pathname === '/expert-analysis'
    }
    return false
  }, [pathname])

  // Don't show navbar on auth pages or admin pages
  const isAuthPage = ['/login', '/signup'].includes(pathname)
  const isAdminPage = pathname.startsWith('/admin')
  if (isAuthPage || isAdminPage) return null

  return (
    <motion.nav 
      className={className || ''}
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50,
        backgroundColor: 'hsl(var(--background))',
        borderBottom: '1px solid hsl(var(--border))'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo
            variant="sm"
            href={user ? '/dashboard' : '/'}
            showIcon={false}
            textClassName="text-foreground"
          />

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {pathname !== '/' && <ThemeSwitcher />}
            {loading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              // Authenticated user - Dropdown menu
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 hover:bg-muted px-2 py-1.5"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                        {user.email ? getUserInitials(user.email) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground hidden sm:inline-block max-w-[200px] truncate">
                      {user.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-popover border-border"
                >
                  {/* Account Info */}
                  <DropdownMenuLabel className="text-muted-foreground font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-popover-foreground">Account</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="bg-border" />
                  
                  {/* Navigation Links */}
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/dashboard')}
                    className={`text-muted-foreground cursor-pointer transition-colors ${
                      isActiveRoute('/dashboard') 
                        ? 'bg-muted text-foreground' 
                        : 'hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                    {isActiveRoute('/dashboard') && (
                      <span className="ml-auto text-xs text-muted-foreground">●</span>
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/blogs')}
                    className={`text-muted-foreground cursor-pointer transition-colors ${
                      isActiveRoute('/blogs') 
                        ? 'bg-muted text-foreground' 
                        : 'hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Insights
                    {isActiveRoute('/blogs') && (
                      <span className="ml-auto text-xs text-muted-foreground">●</span>
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/expert-analysis')}
                    className={`text-muted-foreground cursor-pointer transition-colors ${
                      isActiveRoute('/expert-analysis') 
                        ? 'bg-muted text-foreground' 
                        : 'hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Expert Analysis
                    {isActiveRoute('/expert-analysis') && (
                      <span className="ml-auto text-xs text-muted-foreground">●</span>
                    )}
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">NEW</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-border" />
                  
                  {/* Sign Out */}
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Unauthenticated user navigation
              <div className="flex gap-2">
                <Link href="/login">
                  <Button 
                    variant="default" 
                    size="default"
                    className="rounded-full text-sm sm:text-base"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    variant="brand"
                    size="default"
                    className="text-sm sm:text-base"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}