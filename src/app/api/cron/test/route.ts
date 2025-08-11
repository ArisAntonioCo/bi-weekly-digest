import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { NewsletterService } from '@/services/newsletter.service'

export async function GET(request: NextRequest) {
  try {
    console.log('TEST Cron triggered (ignores schedule):', new Date().toISOString())
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    // Verify this is a Vercel cron job or authorized request
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
      hasVercelId: !!vercelId
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
        message: 'Missing or invalid CRON_SECRET'
      }, { status: 401 })
    }

    // Create service client for database operations
    const supabase = createServiceClient()
    
    // Get active subscribers (same as production)
    const subscribers = await NewsletterService.getActiveSubscribers(supabase)
    
    if (subscribers.length === 0) {
      return NextResponse.json({ 
        message: 'No active subscribers found'
      }, { status: 200 })
    }

    // Generate content (same as production)
    const config = await NewsletterService.getConfiguration(supabase)
    const aiResponse = await NewsletterService.generateContent(config.system_prompt)

    // Send to all subscribers in batch (single API call)
    const now = new Date()
    try {
      await NewsletterService.sendEmail({
        to: subscribers, // Send to all subscribers at once
        subject: 'AI Analysis Report - Weekly Digest',
        isTest: true // This will add [TEST] prefix automatically
      }, aiResponse)
      
      // Single API call success - all emails delivered
      var successCount = subscribers.length
      var failureCount = 0
    } catch (error) {
      console.error('Batch email send failed:', error)
      // Single API call failed - no emails delivered
      var successCount = 0
      var failureCount = subscribers.length
    }

    // Store newsletter (same as production but marked as test)
    await NewsletterService.storeNewsletter(aiResponse, `TEST AI Analysis Report - Weekly Digest`, supabase)

    // Log test event
    await NewsletterService.logNewsletterEvent('test', subscribers.length, {
      success: successCount,
      failed: failureCount,
      cron: true,
      type: 'full-test'
    }, supabase)

    return NextResponse.json({
      success: true,
      message: 'TEST newsletter sent successfully (ignores schedule)',
      stats: {
        totalSubscribers: subscribers.length,
        successfulSends: successCount,
        failedSends: failureCount
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Create service client for error logging
    const supabase = createServiceClient()
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: errorMessage,
      type: 'test-cron'
    }, supabase)
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}