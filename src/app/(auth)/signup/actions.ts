'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { EmailDeliveryService } from '@/services/email-delivery.service'
import { buildPremiumWelcomeEmail } from '@/services/email-templates/premium-welcome-email'
import { logger } from '@/lib/logger'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=%2Flogin&email=${encodeURIComponent(data.email)}`,
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  try {
    const { subject, markdown } = buildPremiumWelcomeEmail({
      recipientEmail: data.email,
    })

    await EmailDeliveryService.sendEmail(
      {
        to: data.email,
        subject,
      },
      markdown
    )
  } catch (sendError) {
    logger.error('Failed to send premium welcome email', sendError, {
      recipient: data.email,
    })
  }

  // Ask user to confirm email before logging in
  redirect('/login?checkEmail=1')
}
