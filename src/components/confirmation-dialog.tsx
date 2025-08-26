'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface SubscriptionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function SubscriptionConfirmDialog({
  open,
  onOpenChange,
  onConfirm
}: SubscriptionConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Subscribe to Newsletter</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;re about to subscribe to our bi-weekly investment insights newsletter. 
            You&apos;ll receive expertly curated content every two weeks directly to your inbox.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Subscribe
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface UnsubscribeConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function UnsubscribeConfirmDialog({
  open,
  onOpenChange,
  onConfirm
}: UnsubscribeConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const isConfirmDisabled = confirmText !== 'UNSUBSCRIBE'

  const handleConfirm = () => {
    if (!isConfirmDisabled) {
      onConfirm()
      setConfirmText('')
    }
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setConfirmText('')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Unsubscribe from Newsletter</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unsubscribe? You will no longer receive our 
            bi-weekly investment insights.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 py-4">
          <p className="text-sm text-muted-foreground">
            To confirm, please type <span className="font-semibold">UNSUBSCRIBE</span> below:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type UNSUBSCRIBE to confirm"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Unsubscribe
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}