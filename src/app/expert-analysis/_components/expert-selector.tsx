"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { User, Target, Shield, TrendingUp, Brain, LineChart, Briefcase } from 'lucide-react'
import { Expert } from '@/types/expert'

interface ExpertSelectorProps {
  experts: Expert[]
  selectedExpert: Expert | null
  onSelectExpert: (expert: Expert) => void
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

export function ExpertSelector({ experts, selectedExpert, onSelectExpert }: ExpertSelectorProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Expert Framework
          </CardTitle>
          <CardDescription>
            Choose an investment expert's perspective for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={experts[0]?.category || 'all'} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="value">Value</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[300px] mt-4">
              <TooltipProvider>
                {['all', 'value', 'growth'].map(category => (
                  <TabsContent key={category} value={category} className="mt-0 space-y-2">
                    {experts
                      .filter(e => category === 'all' || e.category === category)
                      .map(expert => (
                        <Tooltip key={expert.id}>
                          <TooltipTrigger asChild>
                            <div
                              onClick={() => onSelectExpert(expert)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all relative ${
                                selectedExpert?.id === expert.id 
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                                  : 'border-border hover:border-primary/50 hover:shadow-sm'
                              }`}
                            >
                              {/* Selected Indicator */}
                              {selectedExpert?.id === expert.id && (
                                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
                              )}
                              
                              {/* Expert Info */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-medium flex items-center gap-2">
                                    {expert.name}
                                    {expert.category && (
                                      <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-4 ${getCategoryColor(expert.category)}`}
                                      >
                                        <span className="flex items-center gap-0.5">
                                          {getCategoryIcon(expert.category)}
                                          {expert.category.toUpperCase()}
                                        </span>
                                      </Badge>
                                    )}
                                  </div>
                                  {expert.title && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {expert.title}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                                    "{expert.investing_law}"
                                  </div>
                                </div>
                                {selectedExpert?.id === expert.id && (
                                  <Target className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                                )}
                              </div>
                              
                              {/* Focus Areas Tags */}
                              {expert.focus_areas && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {expert.focus_areas.split(',').slice(0, 3).map((area, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full"
                                    >
                                      {area.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-sm">
                            <div className="space-y-2">
                              <p className="font-semibold">{expert.name}'s Framework</p>
                              {expert.framework_description && (
                                <p className="text-xs">{expert.framework_description}</p>
                              )}
                              {expert.focus_areas && (
                                <div>
                                  <p className="text-xs font-medium mb-1">Focus Areas:</p>
                                  <p className="text-xs text-muted-foreground">{expert.focus_areas}</p>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                  </TabsContent>
                ))}
              </TooltipProvider>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Expert Summary */}
      {selectedExpert && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Selected Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{selectedExpert.name}</span>
              {selectedExpert.category && (
                <Badge 
                  variant="outline" 
                  className={`text-[10px] ${getCategoryColor(selectedExpert.category)}`}
                >
                  {selectedExpert.category.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground italic">
              "{selectedExpert.investing_law}"
            </p>
          </CardContent>
        </Card>
      )}
    </>
  )
}