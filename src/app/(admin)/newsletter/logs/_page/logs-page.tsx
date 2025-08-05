"use client"

import { useState } from 'react'
import { 
  LogsHeader, 
  LogsFilter, 
  LogsList,
  LogsStats
} from '../_sections'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { generateMockLogs, type LogEntry } from '../_utils/mock-data'

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(generateMockLogs())
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(logs)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  const handleFilterChange = (filters: {
    search: string
    status: string
    dateRange: { from: Date | undefined; to: Date | undefined }
  }) => {
    let filtered = [...logs]

    // Filter by search term
    if (filters.search) {
      filtered = filtered.filter(log => 
        log.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.message?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status)
    }

    // Filter by date range
    if (filters.dateRange.from) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= filters.dateRange.from!
      )
    }
    if (filters.dateRange.to) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= filters.dateRange.to!
      )
    }

    setFilteredLogs(filtered)
  }

  const handleRefresh = () => {
    // In a real app, this would fetch new logs from the API
    const newLogs = generateMockLogs()
    setLogs(newLogs)
    setFilteredLogs(newLogs)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <LogsHeader onRefresh={handleRefresh} />
        
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>Cron Job Logs:</strong> View execution history of your scheduled newsletter sends. 
            Logs are retained for 30 days and show all automated and manual triggers.
          </AlertDescription>
        </Alert>

        <LogsStats logs={logs} />

        <div className="grid gap-6">
          <Card className="p-6">
            <LogsFilter onFilterChange={handleFilterChange} />
          </Card>
          
          <Card className="p-6">
            <LogsList 
              logs={filteredLogs}
              onSelectLog={setSelectedLog}
              selectedLog={selectedLog}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}