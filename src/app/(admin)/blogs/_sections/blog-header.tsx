"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, BookOpen, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface BlogHeaderProps {
  systemPromptSummary?: string
}

export function BlogHeader({ systemPromptSummary }: BlogHeaderProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const response = await fetch('/api/blogs/regenerate', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate blog content')
      }

      toast.success('Blog content regenerated successfully!')
      // Reload the page to show new content
      window.location.reload()
    } catch (error) {
      toast.error('Failed to regenerate blog content')
      console.error('Regeneration error:', error)
    } finally {
      setIsRegenerating(false)
    }
  }
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Regenerating...' : 'Refresh Content'}
        </Button>
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