"use client"

import { Badge } from '@/components/ui/badge'
import { Settings, Brain, Sparkles } from 'lucide-react'

export function ConfigurationHeader() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
          <Settings className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Configuration</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure Kyle&apos;s AI assistant behavior and expertise
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm">
          <Brain className="h-3 w-3" />
          System Prompt
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm">
          <Sparkles className="h-3 w-3" />
          Dynamic Content
        </Badge>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          The system prompt defines how Kyle&apos;s AI assistant behaves, what expertise it demonstrates, 
          and what type of content it generates. Changes here will automatically update the blog content 
          and chat behavior to reflect the new configuration.
        </p>
      </div>
    </div>
  )
}