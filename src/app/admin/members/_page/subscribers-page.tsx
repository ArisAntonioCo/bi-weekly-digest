"use client"

import { useState, useEffect } from 'react'
import { SubscriberForm } from '../_sections/subscriber-form'
import { SubscribersList } from '../_sections/subscribers-list'
import { Subscriber } from '@/types/subscriber'

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers')
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers || [])
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
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
        <div className="space-y-8">
          {/* Header Section */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Elite Members</h1>
            <p className="text-muted-foreground mt-2">Manage your newsletter audience</p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background to-muted/20 p-6 border border-border/50">
              <div className="relative z-10">
                <div className="text-4xl font-light text-foreground tracking-tight">
                  {subscribers.length.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Total Elite Members</div>
              </div>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-black/5 dark:bg-white/5" />
            </div>
            
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 p-6 border border-green-200/50 dark:border-green-800/30">
              <div className="relative z-10">
                <div className="text-4xl font-light text-green-600 dark:text-green-500 tracking-tight">
                  {subscribers.filter(s => s.subscribed).length.toLocaleString()}
                </div>
                <div className="text-sm text-green-700 dark:text-green-400/70 mt-2">Active</div>
              </div>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
            </div>
            
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10 p-6 border border-yellow-200/50 dark:border-yellow-800/30">
              <div className="relative z-10">
                <div className="text-4xl font-light text-yellow-600 dark:text-yellow-500 tracking-tight">
                  {subscribers.filter(s => !s.subscribed).length.toLocaleString()}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-400/70 mt-2">Inactive</div>
              </div>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-500/10" />
            </div>
          </div>
          
          <SubscriberForm onAddSubscriber={handleAddSubscriber} adding={adding} />
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