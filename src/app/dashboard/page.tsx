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
  BarChart3,
  Bell,
  FileText,
  MessageSquare,
  PieChart
} from 'lucide-react'
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
                  className="rounded-2xl bg-muted/30 hover:bg-muted/50 border-0"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button 
                  variant="default"
                  className="rounded-full text-sm sm:text-base"
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
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            <StatCard
              label="Total Insights"
              value={blogs.length}
              icon={<BookOpen className="h-5 w-5 text-foreground" />}
            />
            <StatCard
              label="Newsletter Status"
              value={subscriptionStatus ? "Active" : "Inactive"}
              icon={<Mail className="h-5 w-5 text-foreground" />}
            />
            <StatCard
              label="Latest Post"
              value={blogs.length > 0 ? format(new Date(blogs[0].created_at), 'MMM d') : 'None'}
              icon={<FileText className="h-5 w-5 text-foreground" />}
            />
            <StatCard
              label="Member Since"
              value={user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'N/A'}
              icon={<User className="h-5 w-5 text-foreground" />}
            />
          </motion.div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-3">
              {/* Latest Investment Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DashboardCard variant="highlight" padding="medium">
                  <CardHeader
                    title="Latest Investment Insights"
                    subtitle="AI-powered market analysis & strategies"
                    icon={<BookOpen className="h-5 w-5 text-foreground" />}
                    action={
                      <Link href="/blogs">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl hover:bg-muted"
                        >
                          View All
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    }
                  />
                  <CardContent>
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
                  </CardContent>
                </DashboardCard>
              </motion.div>

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
                  className="h-full"
                >
                  <CardHeader
                    title="AI Finance Assistant"
                    subtitle="Get instant MOIC projections"
                    icon={<MessageSquare className="h-5 w-5 text-foreground" />}
                  />
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                            <PieChart className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">3Y MOIC Analysis</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Instant projections for any stock</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">5 Expert Advisors</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Professional analysis team</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                            <BarChart3 className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Sector Comparison</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Comparative MOIC analysis</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 transition-colors">
                          <span className="text-sm font-medium text-foreground">Start Analysis</span>
                          <ArrowRight className="h-4 w-4 text-foreground" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </DashboardCard>
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-3">
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
                        "p-3 rounded-2xl text-center",
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
                          className="w-full rounded-xl"
                        >
                          Unsubscribe
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleSubscribe}
                          variant="default"
                          className="w-full rounded-xl"
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