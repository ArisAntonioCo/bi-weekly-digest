"use client"

import { useState } from 'react'
import { DashboardCard, CardHeader, CardContent } from '@/components/dashboard-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Mail, Trash2, ToggleLeft, Send } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Subscriber } from '@/types/subscriber'

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
      <DashboardCard variant="default" padding="medium">
        <CardHeader
          title="Elite Members"
          icon={<Users className="h-5 w-5 text-foreground" />}
        />
        <CardContent>
          <div className="space-y-4">
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
          </div>
        </CardContent>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard variant="default" padding="none">
      <div className="p-6 pb-4">
        <CardHeader
          title="Elite Members"
          subtitle="Manage your newsletter subscribers"
          icon={<Users className="h-5 w-5 text-foreground" />}
        />
      </div>
      
      <CardContent className="pb-0">
        {subscribers.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-normal mb-2 text-foreground">No elite members yet</h3>
            <p className="text-muted-foreground text-sm">Add your first elite member using the form above.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="overflow-x-auto px-6 pb-6">
                <Table className="border-0">
                  <TableHeader>
                    <TableRow className="border-t border-border/50 hover:bg-transparent">
                      <TableHead className="min-w-[200px] text-xs uppercase tracking-wider text-muted-foreground font-normal">Email</TableHead>
                      <TableHead className="min-w-[100px] text-xs uppercase tracking-wider text-muted-foreground font-normal">Status</TableHead>
                      <TableHead className="min-w-[120px] text-xs uppercase tracking-wider text-muted-foreground font-normal">Joined</TableHead>
                      <TableHead className="text-right min-w-[200px] text-xs uppercase tracking-wider text-muted-foreground font-normal">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-normal text-foreground">{subscriber.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={subscriber.subscribed 
                              ? "border-0 bg-emerald-500 text-white hover:bg-emerald-600" 
                              : "border-0 bg-orange-500 text-white hover:bg-orange-600"}
                          >
                            {subscriber.subscribed ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(subscriber.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendEmail(subscriber)}
                              disabled={sendingEmail === subscriber.id || actionLoading === subscriber.id}
                              className="h-9 px-3 hover:bg-muted/50 rounded-full"
                              title="Send AI Analysis"
                            >
                              {sendingEmail === subscriber.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                              ) : (
                                <>
                                  <Send className="h-3 w-3 mr-1" />
                                  Send
                                </>
                              )}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleSubscription(subscriber)}
                              disabled={actionLoading === subscriber.id || sendingEmail === subscriber.id}
                              className="h-9 px-3 hover:bg-muted/50 rounded-full"
                            >
                              {actionLoading === subscriber.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                              ) : (
                                <>
                                  <ToggleLeft className="h-3 w-3 mr-1" />
                                  {subscriber.subscribed ? 'Unsubscribe' : 'Subscribe'}
                                </>
                              )}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9 p-0 rounded-full"
                                  disabled={actionLoading === subscriber.id || sendingEmail === subscriber.id}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Elite Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {subscriber.email} from your elite members list? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSubscriber(subscriber.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Elite Member
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 px-6 pb-6">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="p-4 bg-muted/50 rounded-3xl">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-background/80 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{subscriber.email}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Added {format(new Date(subscriber.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`ml-2 text-xs ${subscriber.subscribed 
                          ? "border-0 bg-emerald-500 text-white hover:bg-emerald-600" 
                          : "border-0 bg-orange-500 text-white hover:bg-orange-600"}`}
                      >
                        {subscriber.subscribed ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-3 border-t border-border/30">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(subscriber)}
                          disabled={sendingEmail === subscriber.id || actionLoading === subscriber.id}
                          className="h-10 text-xs justify-center border-border/50 bg-background/50 hover:bg-background rounded-full"
                        >
                          {sendingEmail === subscriber.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                          ) : (
                            <>
                              <Send className="h-3 w-3 mr-1" />
                              Send Email
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSubscription(subscriber)}
                          disabled={actionLoading === subscriber.id || sendingEmail === subscriber.id}
                          className="h-10 text-xs justify-center border-border/50 bg-background/50 hover:bg-background rounded-full"
                        >
                          {actionLoading === subscriber.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                          ) : (
                            <>
                              <ToggleLeft className="h-3 w-3 mr-1" />
                              {subscriber.subscribed ? 'Unsubscribe' : 'Subscribe'}
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 text-xs w-full justify-center border-border/50"
                            disabled={actionLoading === subscriber.id || sendingEmail === subscriber.id}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete Elite Member
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {subscriber.email} from your elite members list? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSubscriber(subscriber.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                            >
                              Delete Elite Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </DashboardCard>
  )
}