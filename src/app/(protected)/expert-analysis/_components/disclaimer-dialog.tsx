"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { DISCLAIMER_HEADING, DISCLAIMER_PARAGRAPHS } from '@/config/disclaimer'

interface DisclaimerDialogProps {
  open: boolean
  onAccept: () => void
}

export function DisclaimerDialog({ open, onAccept }: DisclaimerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>{DISCLAIMER_HEADING}</DialogTitle>
          </div>
          <DialogDescription className="pt-3 space-y-3">
            {DISCLAIMER_PARAGRAPHS.map(paragraph => (
              <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button 
            onClick={onAccept}
            className="w-full"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
