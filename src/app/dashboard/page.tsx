'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Mail, Calendar, LogOut, User, Clock, CheckCircle } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; created_at?: string } | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean | null>(null)
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
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

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
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-zinc-100 text-zinc-900 flex size-8 items-center justify-center rounded-md">
                <TrendingUp className="size-5" />
              </div>
              <span className="text-xl font-semibold text-zinc-100">Weekly Digest</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-400 text-sm">{user?.email}</span>
              <Button 
                onClick={handleSignOut}
                variant="ghost" 
                className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-100 mb-8">Dashboard</h1>

          <div className="grid gap-6">
            {/* Subscription Status Card */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Newsletter Subscription
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage your weekly investment digest subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {subscriptionStatus ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-zinc-300">You are subscribed to the weekly digest</span>
                      </>
                    ) : (
                      <>
                        <div className="h-5 w-5 rounded-full border-2 border-zinc-600" />
                        <span className="text-zinc-300">You are not subscribed</span>
                      </>
                    )}
                  </div>
                  {subscriptionStatus ? (
                    <Button 
                      onClick={handleUnsubscribe}
                      variant="outline" 
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      Unsubscribe
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubscribe}
                      className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    >
                      Subscribe
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information Card */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-zinc-500 text-sm">Email</p>
                  <p className="text-zinc-300">{user?.email}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Account Type</p>
                  <p className="text-zinc-300">Standard User</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Member Since</p>
                  <p className="text-zinc-300">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Schedule Card */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Newsletter Schedule
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  When you&apos;ll receive your investment digest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-zinc-500" />
                  <span className="text-zinc-300">Every Sunday at 9:00 AM UTC</span>
                </div>
                <p className="text-zinc-500 text-sm mt-2">
                  Get comprehensive market analysis and investment insights delivered to your inbox weekly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}