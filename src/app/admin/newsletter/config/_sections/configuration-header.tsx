"use client"

import { Badge } from '@/components/ui/badge'

export function ConfigurationHeader() {
  return (
    <div className="mb-3">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Configuration</h1>
      <p className="text-muted-foreground mt-1">Configure Kyle's AI assistant behavior and expertise</p>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Badge variant="outline">
          System Prompt
        </Badge>
        <Badge variant="outline">
          Dynamic Content
        </Badge>
      </div>
    </div>
  )
}