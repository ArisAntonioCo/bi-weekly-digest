"use client"

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MailCheck, RefreshCw, ExternalLink } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

function getInboxUrl(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() || ''
  if (domain.includes('gmail.com')) return 'https://mail.google.com/'
  if (domain.includes('outlook.com') || domain.includes('live.com') || domain.includes('hotmail.'))
    return 'https://outlook.live.com/mail/'
  if (domain.includes('yahoo.')) return 'https://mail.yahoo.com/'
  return 'https://www.google.com/search?q=open+email+inbox'
}

interface EmailConfirmationBannerProps {
  email: string
  onEditEmail?: () => void
}

export function EmailConfirmationBanner({ email, onEditEmail }: EmailConfirmationBannerProps) {
  const [sending, setSending] = useState(false)
  const supabase = createClient()
  const inboxUrl = useMemo(() => getInboxUrl(email), [email])

  async function handleResend() {
    try {
      setSending(true)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/confirm?next=%2Flogin&email=${encodeURIComponent(email)}`,
        },
      })
      if (error) throw error
      toast.success('Confirmation email resent. Check your inbox.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to resend confirmation email'
      toast.error(msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <Alert className="w-full overflow-hidden bg-info/10 border-info/20">
      <AlertDescription>
        {/* Stack everything vertically so it never overflows */}
        <div className="w-full flex flex-col gap-3">
          {/* Icon + text */}
          <div className="min-w-0 flex items-start gap-3">
            <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-2">
              <MailCheck className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-foreground leading-5">Check your inbox to confirm your account</p>
              <p className="text-xs text-muted-foreground leading-5 break-words">
                We sent a link to <span className="font-semibold text-foreground break-words">{email}</span>. It may take a minute to arrive.
              </p>
            </div>
          </div>
          {/* Actions below, full width on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <a
              href={inboxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Open inbox
                <ExternalLink className="ml-2 size-3.5" />
              </Button>
            </a>
            <Button size="sm" onClick={handleResend} disabled={sending} className="w-full sm:w-auto inline-flex items-center">
              <RefreshCw className={`mr-2 size-3.5 ${sending ? 'animate-spin' : ''}`} /> Resend
            </Button>
            {onEditEmail && (
              <Button variant="ghost" size="sm" onClick={onEditEmail} className="w-full sm:w-auto text-foreground">
                Change email
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default EmailConfirmationBanner
