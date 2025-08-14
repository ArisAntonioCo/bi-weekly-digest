import { NextRequest } from 'next/server'
import { NewsletterService } from '@/services/newsletter.service'

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

    // Generate and send test newsletter
    const result = await NewsletterService.generateAndSend(
      ['kyle@zaigo.ai'],
      `AI Investment Analysis - ${new Date().toLocaleDateString()}`,
      {
        isTest: true,
        storeNewsletter: false, // Don't store test newsletters
        logEvent: true
      }
    )

    if (!result.success) {
      return NewsletterService.createErrorResponse(
        new Error(result.error || 'Failed to send test newsletter'),
        500
      )
    }

    // Get preview of content for response
    const config = await NewsletterService.getConfiguration()
    const preview = config.system_prompt.substring(0, 500) + '...'

    return NewsletterService.createSuccessResponse(
      'Test newsletter sent successfully',
      {
        preview
      }
    )
  } catch (error) {
    // Log failure
    await NewsletterService.logNewsletterEvent('failed', 0, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      type: 'test'
    })
    
    return NewsletterService.createErrorResponse(error)
  }
}