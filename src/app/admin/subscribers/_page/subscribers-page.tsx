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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">Subscribers</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-muted/30 rounded-2xl p-4 sm:p-6 border-0">
              <div className="text-2xl sm:text-3xl font-medium text-foreground">{subscribers.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Total Subscribers</div>
            </div>
            <div className="bg-muted/30 rounded-2xl p-4 sm:p-6 border-0">
              <div className="text-2xl sm:text-3xl font-medium text-green-600">{subscribers.filter(s => s.subscribed).length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Active Subscribers</div>
            </div>
            <div className="bg-muted/30 rounded-2xl p-4 sm:p-6 border-0 sm:col-span-2 lg:col-span-1">
              <div className="text-2xl sm:text-3xl font-medium text-yellow-600">{subscribers.filter(s => !s.subscribed).length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Inactive Subscribers</div>
            </div>
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
  )
}