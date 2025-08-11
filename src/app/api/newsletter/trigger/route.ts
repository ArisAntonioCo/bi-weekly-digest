import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { NewsletterService } from '@/services/newsletter.service'

// Email recipients
const RECIPIENTS = [
  'kulaizke@gmail.com',
  'arisantonioco@gmail.com'
]

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'kyle@zaigo.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get configuration and generate content
    const config = await NewsletterService.getConfiguration()
    const aiResponse = await NewsletterService.generateContent(config.system_prompt)

    // Send emails to recipients
    const emailPromises = RECIPIENTS.map(email => 
      NewsletterService.sendEmail({
        to: email,
        subject: `AI Investment Analysis - ${new Date().toLocaleDateString()}`
      }, aiResponse)
    )

    const results = await Promise.allSettled(emailPromises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failureCount = results.filter(r => r.status === 'rejected').length

    // Store in database
    await NewsletterService.storeNewsletter(aiResponse)

    // Log the event
    await NewsletterService.logNewsletterEvent('sent', RECIPIENTS.length, {
      success: successCount,
      failed: failureCount,
      recipients: RECIPIENTS
    })

    return NextResponse.json({
      success: true,
      message: `Newsletter sent successfully to ${successCount} recipients`,
      details: {
        sent: successCount,
        failed: failureCount,
        total: RECIPIENTS.length
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log failure
    await NewsletterService.logNewsletterEvent('failed', 0, { error: errorMessage })
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}