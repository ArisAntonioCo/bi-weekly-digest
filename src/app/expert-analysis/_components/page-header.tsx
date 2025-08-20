"use client"

import { Sparkles } from 'lucide-react'

export function PageHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expert Stock Analysis</h1>
          <p className="text-muted-foreground">
            Get AI-powered stock analysis through the lens of legendary investors
          </p>
        </div>
      </div>
    </div>
  )
}