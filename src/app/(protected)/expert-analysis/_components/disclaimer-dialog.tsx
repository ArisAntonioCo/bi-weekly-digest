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
            <DialogTitle>Legal Disclaimer</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            This is an AI tool that simulates expert investment perspectives. 
            It is <span className="font-semibold">NOT financial advice</span>.
            <br /><br />
            Always do your own research and consult qualified advisors before 
            making investment decisions. All investments carry risk.
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