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
  TrendingUp, 
  LogOut, 
  LayoutDashboard, 
  BookOpen,
  ChevronDown
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  className?: string
}

export default function Navbar({ className }: NavbarProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

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
    return false
  }, [pathname])

  // Don't show navbar on auth pages or admin pages
  const isAuthPage = ['/login', '/signup'].includes(pathname)
  const isAdminPage = pathname.startsWith('/admin')
  if (isAuthPage || isAdminPage) return null

  return (
    <nav className={`border-b border-border ${className || ''}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href={user ? '/dashboard' : '/'} 
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <TrendingUp className="size-5" />
            </div>
            <span className="text-xl font-semibold text-foreground">Weekly Digest</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
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
              <>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/80">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}