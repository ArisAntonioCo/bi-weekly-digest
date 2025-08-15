import { NextRequest, NextResponse } from 'next/server'
import { NewsletterService } from '@/services/newsletter.service'
import { withErrorHandler } from '@/lib/error-handler'
import { AuthenticationError } from '@/types/errors'
import { logger } from '@/lib/logger'

// Email recipients
const RECIPIENTS = [
  'kulaizke@gmail.com',
  'arisantonioco@gmail.com'
]

export const POST = withErrorHandler(async (request: NextRequest) => {
  logger.info('Newsletter trigger initiated', { recipients: RECIPIENTS.length })

  // Authenticate request
  const auth = await NewsletterService.authenticateRequest(request, ['kyle@zaigo.ai'])
  
  if (!auth.isAuthorized) {
    throw new AuthenticationError(auth.error || 'Unauthorized')
  }

  logger.debug('Authentication successful', { user: auth.user?.email })

  // Generate and send newsletter
  const result = await NewsletterService.generateAndSend(
    RECIPIENTS,
    `AI Investment Analysis - ${new Date().toLocaleDateString()}`,
    {
      storeNewsletter: true,
      logEvent: true
    }
  )

  if (!result.success) {
    // Log failure
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: result.error || 'Unknown error'
    })
    
    logger.error('Newsletter send failed', undefined, { 
      error: result.error,
      recipients: result.recipients 
    })
    
    throw new Error(result.error || 'Failed to send newsletter')
  }

  logger.info('Newsletter sent successfully', {
    sent: result.successCount,
    failed: result.failureCount,
    total: RECIPIENTS.length
  })

  return NextResponse.json({
    message: `Newsletter sent successfully to ${result.successCount} recipients`,
    details: {
      sent: result.successCount,
      failed: result.failureCount,
      total: RECIPIENTS.length
    }
  }, { status: 200 })
})