import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { NewsletterService } from '@/services/newsletter.service'

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

    // Send test email
    await NewsletterService.sendEmail({
      to: 'kulaizke@gmail.com',
      subject: `AI Investment Analysis - ${new Date().toLocaleDateString()}`,
      isTest: true
    }, aiResponse)

    // Log the test event
    await NewsletterService.logNewsletterEvent('test', 1, {
      recipient: 'kulaizke@gmail.com'
    })

    return NextResponse.json({
      success: true,
      message: 'Test newsletter sent successfully',
      preview: aiResponse.substring(0, 500) + '...'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log failure
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: errorMessage,
      type: 'test'
    })
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}