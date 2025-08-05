"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Download, Activity } from 'lucide-react'
import { useState } from 'react'

interface LogsHeaderProps {
  onRefresh: () => void
}

export function LogsHeader({ onRefresh }: LogsHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleExport = () => {
    // In a real app, this would export the logs to CSV
    console.log('Exporting logs...')
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Cron Job Logs</h2>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          Live
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="hidden sm:flex"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="ml-2 hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>
  )
}