import { createClient } from '@/utils/supabase/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { ContentGenerationService } from './content-generation.service'
import { EmailDeliveryService, type EmailOptions } from './email-delivery.service'

export interface NewsletterConfig {
  system_prompt: string
}

export interface NewsletterAuthResult {
  isAuthorized: boolean
  user?: User
  error?: string
}

export interface NewsletterSendResult {
  success: boolean
  successCount: number
  failureCount: number
  recipients: string[]
  error?: string
}

/**
 * Newsletter Service
 * Orchestrates newsletter operations including authentication, generation, and sending
 */
export class NewsletterService {
  /**
   * Authenticates newsletter-related requests
   * Supports both user authentication and cron job authentication
   */
  static async authenticateRequest(
    request: NextRequest,
    allowedEmails?: string[]
  ): Promise<NewsletterAuthResult> {
    try {
      // Check for cron authentication first
      const authHeader = request.headers.get('authorization')
      const cronSecretFromVercel = request.headers.get('x-vercel-cron-secret')
      const userAgent = request.headers.get('user-agent')
      const vercelId = request.headers.get('x-vercel-id')
      const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
      
      // Check if it's from Vercel cron
      const isVercelInternal = !!cronSecretFromVercel || 
                               (userAgent && userAgent.includes('Vercel')) ||
                               !!vercelId
      const isCronAuthorized = authHeader === expectedAuth || isVercelInternal
      
      if (isCronAuthorized) {
        return { isAuthorized: true }
      }
      
      // Fall back to user authentication
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { isAuthorized: false, error: 'Authentication required' }
      }
      
      // Check if user email is in allowed list
      if (allowedEmails && allowedEmails.length > 0) {
        if (!allowedEmails.includes(user.email || '')) {
          return { isAuthorized: false, error: 'Unauthorized user', user }
        }
      }
      
      return { isAuthorized: true, user }
    } catch (error) {
      return { 
        isAuthorized: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }
    }
  }

  /**
   * Generates newsletter content and sends to recipients
   * Centralized function to avoid duplication across routes
   */
  static async generateAndSend(
    recipients: string[],
    subject: string,
    options?: {
      isTest?: boolean
      supabaseClient?: SupabaseClient
      storeNewsletter?: boolean
      logEvent?: boolean
    }
  ): Promise<NewsletterSendResult> {
    const supabase = options?.supabaseClient || await createClient()
    
    try {
      // Get configuration and generate content
      const config = await this.getConfiguration(supabase)
      const aiResponse = await ContentGenerationService.generateContent(config.system_prompt)
      
      // Send emails to recipients
      let successCount = 0
      let failureCount = 0
      
      if (recipients.length === 1) {
        // Single recipient - send directly
        try {
          await this.sendEmail({
            to: recipients[0],
            subject,
            isTest: options?.isTest
          }, aiResponse)
          successCount = 1
        } catch (error) {
          failureCount = 1
          console.error('Failed to send email:', error)
        }
      } else {
        // Multiple recipients - send in batch or individually
        try {
          await this.sendEmail({
            to: recipients,
            subject,
            isTest: options?.isTest
          }, aiResponse)
          successCount = recipients.length
        } catch (error) {
          // If batch send fails, try individual sends
          console.error('Batch send failed, trying individual sends:', error)
          const emailPromises = recipients.map(email => 
            this.sendEmail({
              to: email,
              subject,
              isTest: options?.isTest
            }, aiResponse)
          )
          
          const results = await Promise.allSettled(emailPromises)
          successCount = results.filter(r => r.status === 'fulfilled').length
          failureCount = results.filter(r => r.status === 'rejected').length
        }
      }
      
      // Store newsletter if requested
      if (options?.storeNewsletter !== false) {
        await this.storeNewsletter(aiResponse, subject, supabase)
      }
      
      // Log event if requested
      if (options?.logEvent !== false) {
        const eventType = options?.isTest ? 'test' : 'sent'
        await this.logNewsletterEvent(eventType, recipients.length, {
          success: successCount,
          failed: failureCount,
          recipients: recipients.length <= 10 ? recipients : `${recipients.length} recipients`
        }, supabase)
      }
      
      return {
        success: true,
        successCount,
        failureCount,
        recipients
      }
    } catch (error) {
      // Log failure
      if (options?.logEvent !== false) {
        await this.logNewsletterEvent('failed', 0, { 
          error: error instanceof Error ? error.message : 'Unknown error'
        }, supabase)
      }
      
      return {
        success: false,
        successCount: 0,
        failureCount: recipients.length,
        recipients,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Creates a standardized error response for newsletter routes
   */
  static createErrorResponse(error: unknown, statusCode: number = 500): NextResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Newsletter error:', errorMessage)
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }

  /**
   * Creates a standardized success response for newsletter routes
   */
  static createSuccessResponse(
    message: string,
    data?: Record<string, unknown>
  ): NextResponse {
    return NextResponse.json({
      success: true,
      message,
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Fetches the newsletter configuration from the database
   */
  static async getConfiguration(supabaseClient?: SupabaseClient): Promise<NewsletterConfig> {
    const supabase = supabaseClient || await createClient()
    
    const { data: configs, error } = await supabase
      .from('configurations')
      .select('system_prompt')
      .limit(1)

    if (error) {
      console.error('Error fetching configuration:', error)
      throw new Error(`Failed to fetch configuration: ${error.message}`)
    }

    if (!configs || configs.length === 0) {
      console.error('No configuration found in database')
      throw new Error('No configuration found. Please add a configuration record to the database.')
    }

    return configs[0] as NewsletterConfig
  }

  /**
   * Sends an email using the EmailDeliveryService
   */
  static async sendEmail(options: EmailOptions, content: string) {
    return EmailDeliveryService.sendEmail(options, content)
  }

  /**
   * Stores the newsletter content in the database
   */
  static async storeNewsletter(content: string, title?: string, supabaseClient?: SupabaseClient): Promise<void> {
    const supabase = supabaseClient || await createClient()
    
    const companyInfo = ContentGenerationService.extractCompanyInfo(content)
    const generatedTitle = `${companyInfo} 3-Year MOIC Analysis: Leveraging the Framework of World-Class Investors`
    
    const { error } = await supabase
      .from('blogs')
      .insert({
        title: title || generatedTitle,
        content,
      })

    if (error) {
      throw new Error(`Failed to store newsletter: ${error.message}`)
    }
  }

  /**
   * Gets active subscribers from the database
   */
  static async getActiveSubscribers(supabaseClient?: SupabaseClient): Promise<string[]> {
    const supabase = supabaseClient || await createClient()
    
    const { data, error } = await supabase
      .from('subscribers')
      .select('email')
      .eq('subscribed', true)

    if (error) {
      throw new Error(`Failed to fetch subscribers: ${error.message}`)
    }

    return data?.map(s => s.email) || []
  }

  /**
   * Logs newsletter send event
   */
  static async logNewsletterEvent(
    type: 'sent' | 'failed' | 'test',
    recipientCount: number,
    metadata?: Record<string, unknown>,
    supabaseClient?: SupabaseClient
  ): Promise<void> {
    const supabase = supabaseClient || await createClient()
    
    await supabase
      .from('newsletter_logs')
      .insert({
        type,
        recipient_count: recipientCount,
        metadata,
        created_at: new Date().toISOString(),
      })
  }

  /**
   * Generates content using ContentGenerationService
   * @deprecated Use ContentGenerationService.generateContent directly
   */
  static async generateContent(systemPrompt: string): Promise<string> {
    return ContentGenerationService.generateContent(systemPrompt)
  }
}