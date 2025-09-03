"use client"

import { Badge } from '@/components/ui/badge'
import { User, Mail, Users } from 'lucide-react'

interface MembersHeaderProps {
  memberCount: number
}

export function MembersHeader({ memberCount }: MembersHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elite Members</h1>
          <p className="text-muted-foreground">
            Manage your elite members with exclusive 3Y MOIC analysis access
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {memberCount} Elite Members
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Mail className="h-3 w-3" />
          Newsletter Ready
        </Badge>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 border">
        <p className="text-sm text-muted-foreground">
          Add and manage elite members who receive exclusive 3-year MOIC projections and investment analysis. 
          All members are validated and have premium access to world-class investor insights.
        </p>
      </div>
    </div>
  )
}