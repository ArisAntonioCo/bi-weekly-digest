'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Mail, Calendar, User, Clock, CheckCircle, BookOpen, ArrowRight, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface Blog {
  id: string
  title: string
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; created_at?: string } | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean | null>(null)
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Check subscription status
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('subscribed')
          .eq('email', user.email)
          .single()

        setSubscriptionStatus(subscriber?.subscribed || false)

        // Fetch latest blogs
        const { data: blogsData } = await supabase
          .from('blogs')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(4)

        setBlogs(blogsData || [])
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase])


  const handleSubscribe = async () => {
    if (!user?.email) return

    try {
      const { error } = await supabase
        .from('subscribers')
        .upsert({
          email: user.email,
          subscribed: true
        })

      if (!error) {
        setSubscriptionStatus(true)
      }
    } catch (error) {
      console.error('Error subscribing:', error)
    }
  }

  const handleUnsubscribe = async () => {
    if (!user?.email) return

    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ subscribed: false })
        .eq('email', user.email)

      if (!error) {
        setSubscriptionStatus(false)
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-100">Welcome back!</h1>
            <p className="text-zinc-400 mt-2">Here&apos;s your investment insights dashboard</p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Latest Investment Insights - Spans 2 columns on large screens */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Latest Investment Insights
                  </span>
                  <Link href="/blogs">
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Recent AI-powered market analysis and investment strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {blogs.length > 0 ? (
                  <div className="space-y-3">
                    {blogs.map((blog) => (
                      <Link 
                        key={blog.id} 
                        href={`/blogs/${blog.id}`}
                        className="block group"
                      >
                        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all">
                          <div className="flex-1">
                            <h3 className="text-zinc-200 font-medium group-hover:text-zinc-100 line-clamp-1">
                              {blog.title}
                            </h3>
                            <p className="text-zinc-500 text-sm mt-1">
                              {format(new Date(blog.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-500">No insights available yet</p>
                    <p className="text-zinc-600 text-sm mt-1">Check back soon for new content</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Newsletter Subscription - Tall card on large screens */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800 lg:row-span-2">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Newsletter
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Weekly investment digest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subscription Status */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {subscriptionStatus ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-zinc-600" />
                    )}
                    <span className="text-zinc-300 text-sm">
                      {subscriptionStatus ? 'Subscribed' : 'Not subscribed'}
                    </span>
                  </div>
                  
                  {subscriptionStatus ? (
                    <Button 
                      onClick={handleUnsubscribe}
                      variant="outline" 
                      className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      Unsubscribe
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubscribe}
                      className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    >
                      Subscribe Now
                    </Button>
                  )}
                </div>

                {/* Schedule Info */}
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <h4 className="text-zinc-300 text-sm font-medium">Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                      <span className="text-zinc-400 text-sm">Every Sunday</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      <span className="text-zinc-400 text-sm">9:00 AM UTC</span>
                    </div>
                  </div>
                </div>

                {/* Next Newsletter */}
                {subscriptionStatus && (
                  <div className="space-y-2 pt-3 border-t border-zinc-800">
                    <h4 className="text-zinc-300 text-sm font-medium">Next Newsletter</h4>
                    <p className="text-zinc-400 text-sm">
                      {(() => {
                        const today = new Date()
                        const nextSunday = new Date(today)
                        nextSunday.setDate(today.getDate() + (7 - today.getDay()))
                        return format(nextSunday, 'MMMM d, yyyy')
                      })()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information - Compact */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
                  <User className="h-4 w-4" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Email</p>
                  <p className="text-zinc-300 text-sm truncate">{user?.email}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Member Since</p>
                  <p className="text-zinc-300 text-sm">
                    {user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
                  <TrendingUp className="h-4 w-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Total Insights</p>
                  <p className="text-zinc-100 text-2xl font-semibold">{blogs.length}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Latest Post</p>
                  <p className="text-zinc-300 text-sm">
                    {blogs.length > 0 
                      ? format(new Date(blogs[0].created_at), 'MMM d')
                      : 'No posts yet'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}