"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Mail, Trash2, ToggleLeft, Send } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Subscriber {
  id: string
  email: string
  subscribed: boolean
  created_at: string
}

interface SubscribersListProps {
  subscribers: Subscriber[]
  loading: boolean
  onToggleSubscription: (id: string, subscribed: boolean) => Promise<{ success: boolean; error?: string }>
  onDeleteSubscriber: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function SubscribersList({ 
  subscribers, 
  loading, 
  onToggleSubscription, 
  onDeleteSubscriber 
}: SubscribersListProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)

  const handleToggleSubscription = async (subscriber: Subscriber) => {
    setActionLoading(subscriber.id)
    await onToggleSubscription(subscriber.id, !subscriber.subscribed)
    setActionLoading(null)
  }

  const handleDeleteSubscriber = async (id: string) => {
    setActionLoading(id)
    await onDeleteSubscriber(id)
    setActionLoading(null)
  }

  const handleSendEmail = async (subscriber: Subscriber) => {
    setSendingEmail(subscriber.id)
    
    try {
      const response = await fetch('/api/email-subscriber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: subscriber.email }),
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success(result.message || `AI analysis sent to ${subscriber.email}!`)
      } else {
        toast.error(`Failed to send email: ${result.error}`)
      }
    } catch {
      toast.error('Failed to send email. Please try again.')
    } finally {
      setSendingEmail(null)
    }
  }


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Subscriber List
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {subscribers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No subscribers yet</h3>
            <p className="text-muted-foreground">Add your first subscriber using the form above.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Email Address</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px] hidden sm:table-cell">Added</TableHead>
                    <TableHead className="text-right min-w-[220px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        {subscriber.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={subscriber.subscribed ? "default" : "secondary"}
                        className={subscriber.subscribed ? "bg-green-100 text-green-800 border-green-200" : "bg-orange-100 text-orange-800 border-orange-200"}
                      >
                        {subscriber.subscribed ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {format(new Date(subscriber.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(subscriber)}
                          disabled={sendingEmail === subscriber.id || actionLoading === subscriber.id}
                          className="text-xs px-2 py-1 h-7"
                          title="Send AI Analysis"
                        >
                          {sendingEmail === subscriber.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSubscription(subscriber)}
                          disabled={actionLoading === subscriber.id || sendingEmail === subscriber.id}
                          className="text-xs px-2 py-1 h-7"
                        >
                          {actionLoading === subscriber.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                          ) : (
                            <>
                              <ToggleLeft className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">{subscriber.subscribed ? 'Unsubscribe' : 'Subscribe'}</span>
                              <span className="sm:hidden">{subscriber.subscribed ? 'Off' : 'On'}</span>
                            </>
                          )}
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2 py-1 h-7"
                              disabled={actionLoading === subscriber.id || sendingEmail === subscriber.id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {subscriber.email} from your subscribers list? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSubscriber(subscriber.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Subscriber
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}