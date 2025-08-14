import { NextRequest } from 'next/server'
import { NewsletterService } from '@/services/newsletter.service'

// Email recipients
const RECIPIENTS = [
  'kulaizke@gmail.com',
  'arisantonioco@gmail.com'
]

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await NewsletterService.authenticateRequest(request, ['kyle@zaigo.ai'])
    
    if (!auth.isAuthorized) {
      return NewsletterService.createErrorResponse(
        new Error(auth.error || 'Unauthorized'),
        401
      )
    }

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
      return NewsletterService.createErrorResponse(
        new Error(result.error || 'Failed to send newsletter'),
        500
      )
    }

    return NewsletterService.createSuccessResponse(
      `Newsletter sent successfully to ${result.successCount} recipients`,
      {
        details: {
          sent: result.successCount,
          failed: result.failureCount,
          total: RECIPIENTS.length
        }
      }
    )
  } catch (error) {
    // Log failure
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NewsletterService.createErrorResponse(error)
  }
}