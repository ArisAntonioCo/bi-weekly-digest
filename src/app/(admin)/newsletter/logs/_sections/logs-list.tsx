"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  ChevronRight,
  Mail,
  Users,
  Timer,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { type LogEntry, getLogStatusColor, formatDuration } from '../_utils/mock-data'
import { cn } from '@/lib/utils'

interface LogsListProps {
  logs: LogEntry[]
  onSelectLog: (log: LogEntry | null) => void
  selectedLog: LogEntry | null
}

export function LogsList({ logs, onSelectLog, selectedLog }: LogsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const getStatusIcon = (status: LogEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />
      default:
        return null
    }
  }

  const getTriggerBadge = (trigger: LogEntry['trigger']) => {
    switch (trigger) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>
      case 'manual':
        return <Badge variant="secondary">Manual</Badge>
      case 'api':
        return <Badge variant="default">API</Badge>
      default:
        return null
    }
  }

  const handleRowClick = (log: LogEntry) => {
    onSelectLog(log)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Execution History</h3>
          <p className="text-sm text-muted-foreground">
            Showing {logs.length} log entries
          </p>
        </div>

        <ScrollArea className="h-[500px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Trigger</TableHead>
                <TableHead className="w-[120px]">Recipients</TableHead>
                <TableHead className="w-[100px]">Duration</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(log)}
                  >
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md w-fit", getLogStatusColor(log.status))}>
                        {getStatusIcon(log.status)}
                        <span className="text-xs font-medium capitalize">{log.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTriggerBadge(log.trigger)}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {log.delivered}/{log.recipients}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">
                        {formatDuration(log.duration)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[300px]">
                        {log.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>
              Execution details for {selectedLog && format(new Date(selectedLog.timestamp), 'PPP HH:mm:ss')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className={cn("flex items-center gap-2 px-3 py-2 rounded-md w-fit", getLogStatusColor(selectedLog.status))}>
                    {getStatusIcon(selectedLog.status)}
                    <span className="font-medium capitalize">{selectedLog.status}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Trigger Type</p>
                  <div className="flex items-center gap-2">
                    {getTriggerBadge(selectedLog.trigger)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Recipients</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedLog.recipients}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Delivered</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{selectedLog.delivered}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>Duration</span>
                  </div>
                  <p className="text-2xl font-bold">{formatDuration(selectedLog.duration)}</p>
                </div>
              </div>

              {selectedLog.details && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Email Metrics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Open Rate</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {(selectedLog.details.openRate! * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Click Rate</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {(selectedLog.details.clickRate! * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>Bounce Rate</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {(selectedLog.details.bounceRate! * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedLog.error && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Error Details</h4>
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-md">
                    <p className="text-sm text-red-900 dark:text-red-100">{selectedLog.error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">Message</h4>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedLog.message}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}