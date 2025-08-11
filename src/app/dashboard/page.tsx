'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  DashboardCard, 
  CardHeader, 
  CardContent,
  StatCard 
} from '@/components/dashboard-card'
import { 
  Mail, 
  User, 
  CheckCircle, 
  BookOpen, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  Bell,
  FileText
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

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

  // Extract user initials for avatar (same as navbar)
  const getUserInitials = (email: string): string => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Don't redirect here - let middleware handle it
          setLoading(false)
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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section with Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Welcome back! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full bg-muted/30 hover:bg-muted/50 border-0"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  className="rounded-full"
                  onClick={() => router.push('/dashboard/moic-analyzer')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3"
          >
            <StatCard
              label="Total Insights"
              value={blogs.length}
              icon={
                <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-foreground" />
                </div>
              }
            />
            <StatCard
              label="Newsletter Status"
              value={subscriptionStatus ? "Active" : "Inactive"}
              icon={
                <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-foreground" />
                </div>
              }
            />
            <StatCard
              label="Latest Post"
              value={blogs.length > 0 ? format(new Date(blogs[0].created_at), 'MMM d') : 'None'}
              icon={
                <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-foreground" />
                </div>
              }
            />
            <StatCard
              label="Member Since"
              value={user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'N/A'}
              icon={
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-indigo-500 text-white text-sm font-medium">
                    {user?.email ? getUserInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              }
            />
          </motion.div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {/* Latest Investment Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full"
              >
                <div className="h-full p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-semibold text-foreground">Latest Investment Insights</h3>
                    <Link href="/blogs">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-transparent underline underline-offset-4 p-0 h-auto"
                      >
                        View All
                      </Button>
                    </Link>
                  </div>
                  <div>
                    {blogs.length > 0 ? (
                      <div className="space-y-2">
                        {blogs.map((blog, index) => (
                          <motion.div
                            key={blog.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Link href={`/blogs/${blog.id}`}>
                              <div className="group p-4 rounded-xl hover:bg-muted/50 transition-all cursor-pointer">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                      {blog.title}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-2">
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(blog.created_at), 'MMM d, yyyy')}
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors mt-1" />
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No insights available yet</p>
                        <p className="text-muted-foreground text-sm mt-1">Check back soon for new content</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-3">
              {/* AI Finance Assistant */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <DashboardCard 
                  variant="default" 
                  clickable 
                  onClick={() => router.push('/dashboard/moic-analyzer')}
                  padding="medium"
                  className="relative overflow-hidden"
                >
                  {/* Decorative Background Shapes */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dots pattern - top right */}
                    <div className="absolute right-8 top-8">
                      <div className="grid grid-cols-3 gap-2">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 bg-foreground/15 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <CardHeader
                      title="AI Assistant"
                      subtitle="Instant MOIC Analysis"
                    />
                    <CardContent className="mt-6">
                      <Button 
                        variant="default" 
                        size="lg"
                        className="w-full rounded-full"
                      >
                        Start Analysis
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </div>
                </DashboardCard>
              </motion.div>

              {/* Newsletter Subscription */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <DashboardCard variant="default" padding="medium">
                  <CardHeader
                    title="Weekly Newsletter"
                    subtitle="Investment digest every Sunday"
                    icon={<Mail className="h-5 w-5 text-foreground" />}
                  />
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className={cn(
                        "p-3 rounded-full text-center",
                        subscriptionStatus 
                          ? "bg-green-500/10 border border-green-500/20" 
                          : "bg-muted border border-border"
                      )}>
                        <div className="flex items-center justify-center gap-2">
                          {subscriptionStatus ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Subscribed</span>
                            </>
                          ) : (
                            <>
                              <Bell className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Not Subscribed</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="space-y-2 p-3 rounded-2xl bg-background/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Frequency</span>
                          <span className="text-xs font-medium">Weekly</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Day</span>
                          <span className="text-xs font-medium">Sunday</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Time</span>
                          <span className="text-xs font-medium">9:00 AM UTC</span>
                        </div>
                        {subscriptionStatus && (
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">Next Issue</span>
                            <span className="text-xs font-medium">
                              {(() => {
                                const today = new Date()
                                const nextSunday = new Date(today)
                                nextSunday.setDate(today.getDate() + (7 - today.getDay()))
                                return format(nextSunday, 'MMM d')
                              })()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {subscriptionStatus ? (
                        <Button 
                          onClick={handleUnsubscribe}
                          variant="outline" 
                          size="lg"
                          className="w-full rounded-full"
                        >
                          Unsubscribe
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleSubscribe}
                          variant="default"
                          size="lg"
                          className="w-full rounded-full"
                        >
                          Subscribe Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </DashboardCard>
              </motion.div>

              {/* Account Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <DashboardCard variant="default" padding="medium">
                  <CardHeader
                    title="Account Details"
                    icon={<User className="h-5 w-5 text-foreground" />}
                  />
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-background/50">
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-background/50">
                        <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                        <p className="text-sm font-medium text-foreground">
                          {user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-2xl bg-background/50 text-center">
                          <p className="text-2xl font-bold text-foreground">{blogs.length}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total Insights</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-background/50 text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {subscriptionStatus ? '✓' : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Newsletter</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </DashboardCard>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}