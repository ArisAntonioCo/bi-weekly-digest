import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { NewsletterService } from '@/services/newsletter.service'

export async function GET(request: NextRequest) {
  try {
    console.log('Test cron triggered:', new Date().toISOString())
    console.log('Environment check:', {
      hasCronSecret: !!process.env.CRON_SECRET,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    })
    
    // For testing, let's be more permissive with auth
    const authHeader = request.headers.get('authorization')
    const cronSecretFromVercel = request.headers.get('x-vercel-cron-secret')
    const userAgent = request.headers.get('user-agent')
    const vercelId = request.headers.get('x-vercel-id')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    console.log('Auth check:', {
      hasAuthHeader: !!authHeader,
      hasCronSecretHeader: !!cronSecretFromVercel,
      hasCronSecret: !!process.env.CRON_SECRET,
      authMatches: authHeader === expectedAuth,
      isVercelCron: !!cronSecretFromVercel,
      userAgent,
      hasVercelId: !!vercelId,
      allHeaders: Array.from(request.headers.entries()).filter(([key]) => 
        key.toLowerCase().startsWith('x-vercel') || key.toLowerCase().includes('cron')
      )
    })
    
    // Allow if proper auth OR it's from Vercel cron (check multiple indicators)
    const isVercelInternal = !!cronSecretFromVercel || 
                             (userAgent && userAgent.includes('Vercel')) ||
                             !!vercelId
    const isAuthorized = authHeader === expectedAuth || isVercelInternal
    
    if (!isAuthorized) {
      console.log('Unauthorized test cron request')
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Missing or invalid CRON_SECRET',
        debug: {
          hasAuthHeader: !!authHeader,
          hasCronSecretHeader: !!cronSecretFromVercel,
          expectedAuthSet: !!process.env.CRON_SECRET
        }
      }, { status: 401 })
    }

    // Create service client for database operations
    const supabase = createServiceClient()
    
    // Generate test content
    const config = await NewsletterService.getConfiguration(supabase)
    const aiResponse = await NewsletterService.generateContent(config.system_prompt)

    // Send test email
    await NewsletterService.sendEmail({
      to: 'kulaizke@gmail.com',
      subject: `AI Investment Analysis - ${new Date().toLocaleDateString()}`
    }, aiResponse)

    // Log test event
    await NewsletterService.logNewsletterEvent('test', 1, {
      recipient: 'kulaizke@gmail.com',
      cron: true
    }, supabase)

    return NextResponse.json({
      success: true,
      message: 'Cron test newsletter sent successfully',
      timestamp: new Date().toISOString(),
      preview: aiResponse.substring(0, 200) + '...'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Create service client for error logging
    const supabase = createServiceClient()
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: errorMessage,
      type: 'cron-test'
    }, supabase)
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}