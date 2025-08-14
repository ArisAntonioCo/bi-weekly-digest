import { NextRequest } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { NewsletterService } from '@/services/newsletter.service'

export async function GET(request: NextRequest) {
  try {
    console.log('Cron triggered (test mode, ignores schedule):', new Date().toISOString())
    
    // Authenticate cron request
    const auth = await NewsletterService.authenticateRequest(request)
    
    if (!auth.isAuthorized) {
      console.log('Unauthorized test cron request')
      return NewsletterService.createErrorResponse(
        new Error(auth.error || 'Unauthorized - Missing or invalid CRON_SECRET'),
        401
      )
    }

    // Create service client for database operations
    const supabase = createServiceClient()
    
    // Get active subscribers
    const subscribers = await NewsletterService.getActiveSubscribers(supabase)
    
    if (subscribers.length === 0) {
      return NewsletterService.createSuccessResponse(
        'No active subscribers found',
        { subscriberCount: 0 }
      )
    }

    // Generate and send newsletter to all subscribers
    const result = await NewsletterService.generateAndSend(
      subscribers,
      'AI Analysis Report - Weekly Digest',
      {
        supabaseClient: supabase,
        storeNewsletter: true,
        logEvent: true
      }
    )

    if (!result.success) {
      return NewsletterService.createErrorResponse(
        new Error(result.error || 'Failed to send newsletter'),
        500
      )
    }

    return NewsletterService.createSuccessResponse(
      'Newsletter sent successfully (test mode, ignores schedule)',
      {
        stats: {
          totalSubscribers: subscribers.length,
          successfulSends: result.successCount,
          failedSends: result.failureCount
        }
      }
    )
  } catch (error) {
    // Create service client for error logging
    const supabase = createServiceClient()
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      type: 'test-cron'
    }, supabase)
    
    return NewsletterService.createErrorResponse(error)
  }
}