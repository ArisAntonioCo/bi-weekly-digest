import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface NewsletterConfig {
  system_prompt: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  isTest?: boolean
}

export class NewsletterService {
  /**
   * Fetches the newsletter configuration from the database
   */
  static async getConfiguration() {
    const supabase = await createClient()
    
    const { data: config, error } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()

    if (error || !config) {
      throw new Error('Configuration not found')
    }

    return config as NewsletterConfig
  }

  /**
   * Generates AI content using OpenAI
   */
  static async generateContent(systemPrompt: string): Promise<string> {
    try {
      // Try Responses API with web search first for real-time market data
      try {
        console.log('Attempting Responses API with web_search_preview for newsletter generation...')
        const response = await openai.responses.create({
          model: 'gpt-5-mini',
          instructions: `${systemPrompt}\n\nIMPORTANT: Use web search to get the most current market data, stock prices, and financial news for the investment analysis.`,
          input: 'Generate comprehensive investment analysis based on current market conditions. Include real-time stock prices and recent market developments.',
          tools: [{ type: 'web_search_preview' }],
        })
        
        console.log('Responses API with web search succeeded for newsletter')
        
        // The response will include web search results integrated into the output
        return response.output_text || 'No response generated'
      } catch (responsesError) {
        console.error('Responses API with web search error:', responsesError)
        console.log('Falling back to Chat Completions...')
        
        // Fallback to regular chat completions
        const completion = await openai.chat.completions.create({
          model: 'gpt-5-mini',
          temperature: 0.45,
          messages: [
            { 
              role: 'system', 
              content: systemPrompt 
            },
            {
              role: 'user',
              content: 'Generate comprehensive investment analysis based on available market data. Note that real-time prices may not be available.'
            }
          ],
          max_tokens: 8000,
        })
        
        return completion.choices[0].message.content || 'No response generated'
      }
    } catch (error) {
      throw new Error(`Failed to generate AI content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Converts markdown to HTML for email
   */
  static convertMarkdownToHtml(markdown: string): string {
    let html = markdown
    
    // Handle tables properly
    const tableRegex = /\|.*\|\n\|[-:\s|]+\|\n(?:\|.*\|\n?)+/gm
    
    html = html.replace(tableRegex, (tableMatch) => {
      const lines = tableMatch.trim().split('\n')
      const headers = lines[0].split('|').filter(h => h.trim()).map(h => h.trim())
      const rows = lines.slice(2).map(line => 
        line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      )
      
      let tableHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          <thead>
            <tr style="background-color: #f9fafb;">`
      
      headers.forEach((header) => {
        tableHtml += `
              <th style="padding: 12px 8px; border: 1px solid #e5e7eb; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #374151; text-align: left;">${header}</th>`
      })
      
      tableHtml += `
            </tr>
          </thead>
          <tbody>`
      
      rows.forEach((row, rowIndex) => {
        const bgColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb'
        tableHtml += `
            <tr style="background-color: ${bgColor};">`
        
        row.forEach((cell) => {
          tableHtml += `
              <td style="padding: 10px 8px; border: 1px solid #e5e7eb; font-size: 14px; color: #4b5563;">${cell}</td>`
        })
        
        tableHtml += `
            </tr>`
      })
      
      tableHtml += `
          </tbody>
        </table>`
      
      return tableHtml
    })
    
    // Headers
    html = html
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px; margin-top: 16px; color: #111827;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; margin-top: 20px; color: #111827;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; margin-top: 24px; color: #111827;">$1</h1>')
      
    // Bold and italic
    html = html
      .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 700; color: #111827;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="font-style: italic;">$1</em>')
      
    // Lists
    html = html
      .replace(/^[\*\-•]\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;">$1</li>')
      .replace(/^\d+\.\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;">$1</li>')
    
    // Wrap list items in ul tags
    const lines = html.split('\n')
    const processedLines: string[] = []
    let inList = false
    
    for (const line of lines) {
      if (line.includes('<li')) {
        if (!inList) {
          processedLines.push('<ul style="margin-bottom: 16px; padding-left: 20px;">')
          inList = true
        }
        processedLines.push(line)
      } else {
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(line)
      }
    }
    
    if (inList) {
      processedLines.push('</ul>')
    }
    
    html = processedLines.join('\n')
    
    // Paragraphs
    html = html
      .split('\n\n')
      .map(para => {
        para = para.trim()
        if (para && !para.includes('<h') && !para.includes('<ul') && !para.includes('<li') && !para.includes('<table')) {
          return `<p style="margin-bottom: 16px; line-height: 1.7; color: #4b5563;">${para}</p>`
        }
        return para
      })
      .join('\n\n')
    
    return html
  }

  /**
   * Creates the email HTML template
   */
  static createEmailTemplate(content: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #111827;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      background-color: #f9fafb;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
      padding: 45px;
      margin: 0;
      position: relative;
      overflow: hidden;
    }
    .header::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 200%;
      height: 100%;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%);
      animation: shimmer 3s infinite;
    }
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    .analysis-section {
      padding: 32px;
    }
    .content {
      color: #374151;
    }
    .footer {
      padding: 24px 32px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    .footer p {
      margin: 4px 0;
      font-size: 12px;
      color: #6b7280;
    }
    .footer-logo {
      font-weight: 600;
      color: #111827;
    }
    /* Responsive adjustments */
    @media (max-width: 600px) {
      .header {
        padding: 24px;
      }
      .header h1 {
        font-size: 24px;
      }
      .analysis-section {
        padding: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header"></div>
      
      <div class="analysis-section">
        <div class="content">
          ${content}
        </div>
      </div>
      
      <div class="footer">
        <p>This analysis was generated using AI-powered investment research</p>
        <p class="footer-logo">Weekly Digest</p>
      </div>
    </div>
  </div>
</body>
</html>`
  }

  /**
   * Sends an email using Resend
   */
  static async sendEmail(options: EmailOptions, content: string) {
    const { to, subject, isTest = false } = options
    const htmlContent = this.convertMarkdownToHtml(content)
    const emailTemplate = this.createEmailTemplate(htmlContent)

    // Determine analysis type for badge
    const getAnalysisType = (content: string) => {
      if (content.toLowerCase().includes('moic') || content.toLowerCase().includes('multiple on invested capital')) {
        return { type: 'MOIC Analysis', color: '#111827' }
      }
      if (content.toLowerCase().includes('bear case') || content.toLowerCase().includes('risk')) {
        return { type: 'Risk Assessment', color: '#374151' }
      }
      return { type: 'Investment Insight', color: '#6b7280' }
    }

    const analysisType = getAnalysisType(content)

    // Format the text content for email
    const markdownContent = `# AI Analysis Report

**Generated:** ${new Date().toLocaleString()}
**Model:** GPT-5-mini
**Type:** ${analysisType.type}

## Analysis

${content}

---

*This analysis was generated using the current system prompt configuration.*
*Weekly Digest - AI-Powered Content Assistant*`

    return await resend.emails.send({
      from: 'Weekly Digest <noreply@updates.fitzsixto.com>',
      to,
      subject: isTest ? `[TEST] ${subject}` : subject,
      html: emailTemplate,
      text: markdownContent,
    })
  }

  /**
   * Stores the newsletter content in the database
   */
  static async storeNewsletter(content: string, title?: string): Promise<void> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('blogs')
      .insert({
        title: title || `AI Investment Analysis - ${new Date().toLocaleDateString()}`,
        content,
      })

    if (error) {
      throw new Error(`Failed to store newsletter: ${error.message}`)
    }
  }

  /**
   * Gets active subscribers from the database
   */
  static async getActiveSubscribers(): Promise<string[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('subscribers')
      .select('email')
      .eq('is_active', true)

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
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const supabase = await createClient()
    
    await supabase
      .from('newsletter_logs')
      .insert({
        type,
        recipient_count: recipientCount,
        metadata,
        created_at: new Date().toISOString(),
      })
  }
}