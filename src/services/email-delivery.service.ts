import { resend } from '@/lib/resend'
import { EmailTemplateService } from './email-template.service'
import { DISCLAIMER_SHORT } from '@/config/disclaimer'

export interface EmailOptions {
  to: string | string[]
  subject: string
  isTest?: boolean
}

interface AnalysisType {
  type: string
  color: string
}

/**
 * Email Delivery Service
 * Handles email sending via Resend
 */
export class EmailDeliveryService {
  /**
   * Sends an email using Resend
   */
  static async sendEmail(options: EmailOptions, content: string) {
    const { to, subject } = options
    const htmlContent = EmailTemplateService.convertMarkdownToHtml(content)
    const emailTemplate = EmailTemplateService.createEmailTemplate(htmlContent)

    const analysisType = this.determineAnalysisType(content)

    // Format the text content for email
    const markdownContent = this.createTextContent(content, analysisType)

    return await resend.emails.send({
      from: 'Weekly Digest <noreply@updates.fitzsixto.com>',
      to,
      subject,
      html: emailTemplate,
      text: markdownContent,
    })
  }

  /**
   * Determines the type of analysis based on content
   */
  private static determineAnalysisType(content: string): AnalysisType {
    const contentLower = content.toLowerCase()
    
    if (contentLower.includes('moic') || contentLower.includes('multiple on invested capital')) {
      return { type: 'MOIC Analysis', color: '#111827' }
    }
    if (contentLower.includes('bear case') || contentLower.includes('risk')) {
      return { type: 'Risk Assessment', color: '#374151' }
    }
    return { type: 'Investment Insight', color: '#6b7280' }
  }

  /**
   * Creates the plain text version of the email content
   */
  private static createTextContent(content: string, analysisType: AnalysisType): string {
    return `# AI Analysis Report

**Generated:** ${new Date().toLocaleString()}
**Model:** gpt-4o with Web Search
**Type:** ${analysisType.type}

**Disclaimer:** ${DISCLAIMER_SHORT}

## Analysis

${content}

---

*This analysis was generated using AI-powered investment research.*
*Weekly Digest - AI-Powered Content Assistant*`
  }
}
