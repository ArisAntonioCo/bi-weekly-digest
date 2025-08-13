import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { NewsletterService } from '@/services/newsletter.service'

export async function POST() {
  try {
    // Check authentication and user permissions
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'kyle@zaigo.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get configuration and generate content using the same method as bulk sends
    const config = await NewsletterService.getConfiguration()
    const aiResponse = await NewsletterService.generateContent(config.system_prompt)

    // Use NewsletterService for consistent email formatting
    const emailResult = await NewsletterService.sendEmail({
      to: 'kulaizke@gmail.com',
      subject: 'AI Analysis Report - Weekly Digest'
    }, aiResponse)

    // Log the event
    await NewsletterService.logNewsletterEvent('sent', 1, {
      recipient: 'kulaizke@gmail.com',
      type: 'prompt-test'
    })

    return NextResponse.json({
      success: true,
      message: 'System prompt has been emailed successfully!',
      emailId: emailResult.data?.id
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log failure
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: errorMessage,
      type: 'prompt-test'
    })
    
    console.error('Email API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process email request' 
    }, { status: 500 })
  }
}