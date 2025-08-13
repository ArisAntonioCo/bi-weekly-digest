import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { NewsletterService } from '@/services/newsletter.service'

export async function POST(request: Request) {
  let email: string | undefined
  
  try {
    // Check authentication and user permissions
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'kyle@zaigo.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the email from request body
    const body = await request.json()
    email = body.email

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get configuration and generate content using the same method as bulk sends
    const config = await NewsletterService.getConfiguration()
    const aiResponse = await NewsletterService.generateContent(config.system_prompt)

    // Send email using NewsletterService for consistency
    const emailResult = await NewsletterService.sendEmail({
      to: email,
      subject: 'AI Analysis Report - Weekly Digest'
    }, aiResponse)

    // Log the event
    await NewsletterService.logNewsletterEvent('sent', 1, {
      recipient: email,
      type: 'individual'
    })

    return NextResponse.json({
      success: true,
      message: `AI analysis has been emailed successfully to ${email}!`,
      emailId: emailResult.data?.id
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log failure
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: errorMessage,
      type: 'individual',
      recipient: email
    })
    
    console.error('Email API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process email request' 
    }, { status: 500 })
  }
}