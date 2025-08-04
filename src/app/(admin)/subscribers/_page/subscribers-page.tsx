"use client"

import { useState, useEffect } from 'react'
import { SubscriberForm } from '../_sections/subscriber-form'
import { SubscribersList } from '../_sections/subscribers-list'

interface Subscriber {
  id: string
  email: string
  subscribed: boolean
  created_at: string
}

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 border">
              <div className="text-2xl font-bold text-primary">{subscribers.length}</div>
              <div className="text-sm text-muted-foreground">Total Subscribers</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border">
              <div className="text-2xl font-bold text-green-600">{subscribers.filter(s => s.subscribed).length}</div>
              <div className="text-sm text-muted-foreground">Active Subscribers</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border">
              <div className="text-2xl font-bold text-orange-600">{subscribers.filter(s => !s.subscribed).length}</div>
              <div className="text-sm text-muted-foreground">Inactive Subscribers</div>
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