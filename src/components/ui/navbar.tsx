'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { TrendingUp, LogOut, User, LayoutDashboard } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Don't show navbar on auth pages
  const isAuthPage = ['/login', '/signup'].includes(pathname)
  if (isAuthPage) return null

  return (
    <nav className="border-b border-zinc-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="bg-zinc-100 text-zinc-900 flex size-8 items-center justify-center rounded-md">
              <TrendingUp className="size-5" />
            </div>
            <span className="text-xl font-semibold text-zinc-100">Weekly Digest</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="text-zinc-400 text-sm">Loading...</div>
            ) : user ? (
              // Authenticated user navigation
              <>
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/blogs">
                  <Button 
                    variant="ghost" 
                    className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    Insights
                  </Button>
                </Link>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-zinc-400 text-sm flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {user.email}
                  </span>
                  <Button 
                    onClick={handleSignOut}
                    variant="ghost" 
                    size="sm"
                    className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              // Unauthenticated user navigation
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
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