"use client"

import { useState, useEffect } from 'react'
import { SubscriberForm } from '../_sections/subscriber-form'
import { SubscribersList } from '../_sections/subscribers-list'
import { Subscriber } from '@/types/subscriber'
import { Button } from '@/components/ui/button'
import { AlertCircle, Users, UserCheck, UserX } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatCard } from '@/components/dashboard-card'

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscribers = async () => {
    setError(null)
    try {
      const response = await fetch('/api/subscribers')
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers || [])
      } else {
        throw new Error('Failed to fetch subscribers')
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      setError('Failed to load subscribers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const handleAddSubscriber = async (email: string) => {
    setAdding(true)
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        await fetchSubscribers()
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Failed to add subscriber' }
      }
    } catch {
      return { success: false, error: 'Network error' }
    } finally {
      setAdding(false)
    }
  }

  const handleToggleSubscription = async (id: string, subscribed: boolean) => {
    try {
      const response = await fetch('/api/subscribers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, subscribed }),
      })

      if (response.ok) {
        await fetchSubscribers()
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Failed to update subscriber' }
      }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    try {
      const response = await fetch('/api/subscribers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        await fetchSubscribers()
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Failed to delete subscriber' }
      }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
        <div className="space-y-3">
          {/* Header Section - Always visible */}
          <div className="mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Subscribers</h1>
            <p className="text-muted-foreground mt-1">Manage your newsletter audience</p>
          </div>
          
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setLoading(true)
                    fetchSubscribers()
                  }}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Stats Grid - Show skeletons while loading */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard
              label="Total Subscribers"
              value={loading ? '—' : subscribers.length.toLocaleString()}
              icon={
                <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
              }
            />
            
            <StatCard
              label="Active Subscribers"
              value={loading ? '—' : subscribers.filter(s => s.subscribed).length.toLocaleString()}
              icon={
                <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-foreground" />
                </div>
              }
            />
            
            <StatCard
              label="Inactive Subscribers"
              value={loading ? '—' : subscribers.filter(s => !s.subscribed).length.toLocaleString()}
              icon={
                <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-foreground" />
                </div>
              }
            />
          </div>
          
          {/* Subscriber Form - Always visible */}
          <SubscriberForm onAddSubscriber={handleAddSubscriber} adding={adding} />
          
          {/* Subscribers List - Pass loading state for skeleton */}
          <SubscribersList 
            subscribers={subscribers}
            loading={loading}
            onToggleSubscription={handleToggleSubscription}
            onDeleteSubscriber={handleDeleteSubscriber}
          />
        </div>
      </div>
    </div>
  )
}