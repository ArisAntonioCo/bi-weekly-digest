"use client"

import { Badge } from '@/components/ui/badge'
import { TrendingUp, BookOpen } from 'lucide-react'

export function BlogHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MOIC Mastery Blog</h1>
            <p className="text-muted-foreground">
              Expert 3-year projections powered by elite investor insights
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          3Y MOIC Analysis
        </Badge>
        <Badge variant="outline">Elite Investor Perspectives</Badge>
        <Badge variant="outline">AI-Powered Insights</Badge>
      </div>
    </div>
  )
}