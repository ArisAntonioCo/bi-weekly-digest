"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Shield, TrendingUp, Brain, LineChart, Briefcase } from 'lucide-react'
import { Expert } from '@/types/expert'

interface LoadingStateProps {
  stockTicker: string
  selectedExpert: Expert | null
}

// Helper function to get category icon
function getCategoryIcon(category?: string) {
  switch (category) {
    case 'value':
      return <Shield className="h-3 w-3" />
    case 'growth':
      return <TrendingUp className="h-3 w-3" />
    case 'tech':
      return <Brain className="h-3 w-3" />
    case 'macro':
      return <LineChart className="h-3 w-3" />
    default:
      return <Briefcase className="h-3 w-3" />
  }
}

// Helper function to get category color
function getCategoryColor(category?: string) {
  switch (category) {
    case 'value':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'growth':
      return 'bg-green-500/10 text-green-600 border-green-500/20'
    case 'tech':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    case 'macro':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}

export function LoadingState({ stockTicker, selectedExpert }: LoadingStateProps) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              {getCategoryIcon(selectedExpert?.category)}
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              Analyzing {stockTicker}
            </p>
            <p className="text-sm text-muted-foreground">
              Applying {selectedExpert?.name}'s investment framework
            </p>
            {selectedExpert?.category && (
              <Badge 
                variant="outline" 
                className={`${getCategoryColor(selectedExpert.category)}`}
              >
                {selectedExpert.category.toUpperCase()} ANALYSIS
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}