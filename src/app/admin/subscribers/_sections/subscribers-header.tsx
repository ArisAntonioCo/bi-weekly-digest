"use client"

import { Badge } from '@/components/ui/badge'
import { User, Mail, Users } from 'lucide-react'

interface SubscribersHeaderProps {
  subscriberCount: number
}

export function SubscribersHeader({ subscriberCount }: SubscribersHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscribers</h1>
          <p className="text-muted-foreground">
            Manage your newsletter subscribers and mailing list
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {subscriberCount} Subscribers
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Mail className="h-3 w-3" />
          Newsletter Ready
        </Badge>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 border">
        <p className="text-sm text-muted-foreground">
          Add and manage email subscribers for your weekly digest newsletter. 
          All emails are validated and stored securely with subscription status tracking.
        </p>
      </div>
    </div>
  )
}