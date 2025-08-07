import { NextRequest, NextResponse } from 'next/server'
import { NewsletterService } from '@/services/newsletter.service'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron job or authorized request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate test content
    const config = await NewsletterService.getConfiguration()
    const aiResponse = await NewsletterService.generateContent(config.system_prompt)

    // Send test email
    await NewsletterService.sendEmail({
      to: 'kulaizke@gmail.com',
      subject: `[CRON TEST] AI Investment Analysis - ${new Date().toLocaleDateString()}`,
      isTest: true
    }, aiResponse)

    // Log test event
    await NewsletterService.logNewsletterEvent('test', 1, {
      recipient: 'kulaizke@gmail.com',
      cron: true
    })

    return NextResponse.json({
      success: true,
      message: 'Cron test newsletter sent successfully',
      timestamp: new Date().toISOString(),
      preview: aiResponse.substring(0, 200) + '...'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: errorMessage,
      type: 'cron-test'
    })
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}