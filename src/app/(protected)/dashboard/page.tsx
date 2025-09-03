'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DashboardCard, 
  CardHeader, 
  CardContent,
  StatCard 
} from '@/components/dashboard-card'
import { 
  Mail, 
  User, 
  BookOpen, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react'
import Avvvatars from 'avvvatars-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { motion } from 'motion/react'
import { NewsletterScheduleCard } from '@/components/newsletter-schedule-card'
import { useNewsletterSchedule } from '@/hooks/useNewsletterSchedule'
import { useBlogViews } from '@/hooks/use-blog-views'
import { useSubscription } from '@/hooks/useSubscription'
import { SubscriptionConfirmDialog, UnsubscribeConfirmDialog } from '@/components/confirmation-dialog'
import { toast } from 'sonner'

interface Blog {
  id: string
  title: string
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; created_at?: string } | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean | null>(null)
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [totalBlogCount, setTotalBlogCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false)
  const [unsubscribeDialogOpen, setUnsubscribeDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { schedule, loading: scheduleLoading, error: scheduleError } = useNewsletterSchedule()
  const { viewedBlogIds, markAsViewed } = useBlogViews()
  const { isSubscribed, subscribe, unsubscribe } = useSubscription()

  // Extract user initials for avatar (same as navbar)
  const getUserInitials = (email: string): string => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  useEffect(() => {
    loadUserData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedBlogIds]) // We intentionally exclude loadUserData to avoid infinite loops


  const handleSubscribe = async () => {
    setSubscribeDialogOpen(true)
  }

  const handleUnsubscribe = async () => {
    setUnsubscribeDialogOpen(true)
  }

  const confirmSubscribe = async () => {
    try {
      await subscribe()
      setSubscriptionStatus(true)
      setSubscribeDialogOpen(false)
      toast.success("Successfully subscribed!", {
        description: "You'll receive our bi-weekly investment insights.",
      })
      // Refresh the subscription status after successful subscription
      await loadUserData()
    } catch (error) {
      console.error('Error subscribing:', error)
      const errorMessage = error instanceof Error ? error.message : "Unable to subscribe. Please try again."
      toast.error("Subscription failed", {
        description: errorMessage,
      })
    }
  }

  const confirmUnsubscribe = async () => {
    try {
      await unsubscribe()
      setSubscriptionStatus(false)
      setUnsubscribeDialogOpen(false)
      toast.success("Successfully unsubscribed", {
        description: "You will no longer receive our newsletter.",
      })
      // Refresh the subscription status after successful unsubscription
      await loadUserData()
    } catch (error) {
      console.error('Error unsubscribing:', error)
      const errorMessage = error instanceof Error ? error.message : "Unable to unsubscribe. Please try again."
      toast.error("Unsubscribe failed", {
        description: errorMessage,
      })
    }
  }

  // Extract loadUserData function outside useEffect to make it reusable
  const loadUserData = async () => {
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

      // Fetch total blog count
      const { count: totalCount } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })

      setTotalBlogCount(totalCount || 0)

      // Fetch ALL blog IDs to properly calculate unread count
      const { data: allBlogIds } = await supabase
        .from('blogs')
        .select('id')

      // Calculate unread count
      if (allBlogIds) {
        const unreadBlogsCount = allBlogIds.filter(blog => !viewedBlogIds.includes(blog.id)).length
        setUnreadCount(unreadBlogsCount)
      }

      // Fetch latest blogs for display (max 10)
      const { data: blogsData } = await supabase
        .from('blogs')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      setBlogs(blogsData || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
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
      {/* Confirmation Dialogs */}
      <SubscriptionConfirmDialog
        open={subscribeDialogOpen}
        onOpenChange={setSubscribeDialogOpen}
        onConfirm={confirmSubscribe}
      />
      <UnsubscribeConfirmDialog
        open={unsubscribeDialogOpen}
        onOpenChange={setUnsubscribeDialogOpen}
        onConfirm={confirmUnsubscribe}
      />
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
                  Welcome back{user?.email ? `, ${user.email.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` : ''}! <span className="inline-block animate-wave">👋</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <Button 
                variant="default"
                size="lg"
                className="rounded-full"
                onClick={() => router.push('/dashboard/moic-analyzer')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3"
          >
            <div className="relative">
              {unreadCount > 0 && (
                <Badge variant="new" className="absolute -top-2 -right-2 z-10 text-[10px] px-2 py-0.5">
                  {unreadCount} NEW
                </Badge>
              )}
              <StatCard
                label="Total Insights"
                value={totalBlogCount}
                icon={
                  <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-foreground" />
                  </div>
                }
              />
            </div>
            <StatCard
              label="Newsletter Status"
              value={isSubscribed ? "Active" : "Inactive"}
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
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">Latest Investment Insights</h3>
                      {totalBlogCount > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Showing {Math.min(blogs.length, 10)} of {totalBlogCount} insights
                        </p>
                      )}
                    </div>
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
                      <>
                        <div className="space-y-2">
                          {blogs.map((blog, index) => {
                            const isNew = !viewedBlogIds.includes(blog.id)
                            return (
                              <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                <Link 
                                  href={`/blogs/${blog.id}`}
                                  onClick={() => markAsViewed(blog.id)}
                                >
                                  <div className="group p-4 rounded-xl hover:bg-muted/50 transition-all cursor-pointer relative">
                                    {isNew && (
                                      <Badge 
                                        variant="new" 
                                        className="absolute -top-2 -left-2 text-[10px] px-1.5 py-0.5"
                                      >
                                        NEW
                                      </Badge>
                                    )}
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
                            )
                          })}
                        </div>
                        {totalBlogCount > 10 && (
                          <div className="mt-4 pt-4 border-t border-border/50 text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                              {totalBlogCount - 10} more insights available
                            </p>
                            <Link href="/blogs">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="rounded-full"
                              >
                                View All Insights
                                <ArrowRight className="h-3 w-3 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </>
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
                  padding="none"
                  className="relative overflow-hidden cursor-pointer hover:bg-muted/70 h-full flex flex-col"
                >
                  {/* Decorative Background Shape */}
                  <div className="absolute -top-24 -right-24 pointer-events-none opacity-50">
                    <div 
                      className="inline-block transition-transform duration-500 [&>div]:!bg-transparent [&_svg]:!bg-transparent [&_svg_rect]:!fill-transparent [&_svg_path]:!fill-muted-foreground/10"
                      style={{ 
                        animation: 'spin 20s linear infinite' 
                      }}
                    >
                      <Avvvatars 
                        value="00"
                        style="shape"
                        size={280}
                      />
                    </div>
                  </div>
                  
                  {/* Content Container */}
                  <div className="relative z-10 p-6 flex flex-col flex-1">
                    <div className="flex-1">
                      <CardHeader
                        title="AI Assistant"
                        subtitle="Instant MOIC Analysis"
                      />
                    </div>
                    <Button 
                      variant="default" 
                      size="lg"
                      className="w-full rounded-full mt-auto"
                      onClick={() => router.push('/dashboard/moic-analyzer')}
                    >
                      Start Analysis
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </DashboardCard>
              </motion.div>

              {/* Expert Stock Analysis - NEW */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="relative"
              >
                {/* New Feature Badge - Top Right */}
                <Badge 
                  variant="feature" 
                  className="absolute -top-2 -right-2 z-10 text-[10px] px-2 py-0.5 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  NEW FEATURE
                </Badge>
                
                <DashboardCard 
                  variant="default" 
                  padding="none"
                  className="overflow-hidden cursor-pointer hover:bg-muted/70 border-primary/20 h-full flex flex-col"
                >
                  {/* Content Container */}
                  <div className="relative z-10 p-6 flex flex-col flex-1">
                    <div className="flex-1">
                      <CardHeader
                        title="Expert Analysis"
                        subtitle="Stock insights via legendary investors"
                        icon={
                          <div className="[&>div]:!bg-transparent [&_svg]:!bg-transparent [&_svg_rect]:!fill-transparent [&_svg_path]:!fill-primary">
                            <Avvvatars 
                              value="53"
                              style="shape"
                              size={32}
                            />
                          </div>
                        }
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full rounded-full border-primary/20 hover:bg-primary/5 mt-auto"
                      onClick={() => router.push('/expert-analysis')}
                    >
                      Analyze Stocks
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </DashboardCard>
              </motion.div>

              {/* Newsletter Subscription */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <NewsletterScheduleCard
                  subscriptionStatus={subscriptionStatus}
                  onSubscribe={handleSubscribe}
                  onUnsubscribe={handleUnsubscribe}
                  schedule={schedule}
                  loading={scheduleLoading}
                  error={scheduleError}
                />
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
                          <p className="text-2xl font-bold text-foreground">{totalBlogCount}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total Insights</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-background/50 text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {isSubscribed ? '✓' : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Subscribed</p>
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