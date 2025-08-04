"use client"

import { Badge } from '@/components/ui/badge'
import { Settings, Brain, Sparkles } from 'lucide-react'

export function ConfigurationHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Configuration</h1>
          <p className="text-muted-foreground">
            Configure Kyle's AI assistant behavior and expertise
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          System Prompt
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Dynamic Content
        </Badge>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 border">
        <p className="text-sm text-muted-foreground">
          The system prompt defines how Kyle's AI assistant behaves, what expertise it demonstrates, 
          and what type of content it generates. Changes here will automatically update the blog content 
          and chat behavior to reflect the new configuration.
        </p>
      </div>
    </div>
  )
}