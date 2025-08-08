"use client"

import { Badge } from '@/components/ui/badge'
import { TrendingUp, BookOpen } from 'lucide-react'

interface BlogHeaderProps {
  systemPromptSummary?: string
}

export function BlogHeader({ systemPromptSummary }: BlogHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investment Analysis Blog</h1>
            <p className="text-muted-foreground">
              Dynamic insights generated from our AI investment analyst
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
      
      <div className="bg-muted/50 rounded-lg p-4 border">
        <p className="text-sm text-muted-foreground">
          {systemPromptSummary || 
            'Our AI analyst provides comprehensive analysis and insights based on the current system configuration.'}
        </p>
      </div>
    </div>
  )
}