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
      // Try Responses API first
      try {
        const response = await openai.responses.create({
          model: 'gpt-4o',
          temperature: 0.45,
          instructions: systemPrompt,
          input: '',
          tools: [{ type: 'web_search_preview' }],
        })
        
        return response.output_text || 'No response generated'
      } catch {
        // Fallback to regular chat completions
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          temperature: 0.45,
          messages: [
            { 
              role: 'system', 
              content: systemPrompt 
            },
            {
              role: 'user',
              content: ''
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
    // Basic markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      // Lists
      .replace(/^\* (.+)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Code blocks
      .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')

    return `<p>${html}</p>`
  }

  /**
   * Creates the email HTML template
   */
  static createEmailTemplate(content: string, isTest: boolean = false): string {
    const testBanner = isTest ? `
      <div style="background-color: #fef2f2; border: 2px solid #dc2626; color: #dc2626; padding: 12px; margin-bottom: 20px; border-radius: 8px; text-align: center; font-weight: bold;">
        ⚠️ TEST EMAIL - This is a test newsletter
      </div>
    ` : ''

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
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #1f2937;
      margin-top: 28px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    h1 { font-size: 28px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    p {
      margin-bottom: 16px;
      color: #4b5563;
      line-height: 1.7;
    }
    ul, ol {
      margin-bottom: 16px;
      padding-left: 24px;
      color: #4b5563;
    }
    li {
      margin-bottom: 8px;
      line-height: 1.7;
    }
    strong {
      color: #1f2937;
      font-weight: 600;
    }
    em {
      font-style: italic;
      color: #6b7280;
    }
    a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    a:hover {
      color: #764ba2;
      text-decoration: underline;
    }
    blockquote {
      border-left: 4px solid #667eea;
      padding-left: 20px;
      margin: 20px 0;
      color: #6b7280;
      font-style: italic;
    }
    code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #1f2937;
    }
    pre {
      background-color: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 20px 0;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 8px 0;
      color: #6b7280;
      font-size: 14px;
    }
    .unsubscribe {
      color: #9ca3af;
      font-size: 12px;
      text-decoration: none;
      margin-top: 16px;
      display: inline-block;
    }
    .unsubscribe:hover {
      color: #6b7280;
      text-decoration: underline;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #1f2937;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 2px 4px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${testBanner}
      <div class="header">
        <h1>📊 AI Investment Analysis</h1>
        <p>Your Bi-Weekly Market Intelligence Report</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p><strong>Bi-Weekly Investment Digest</strong></p>
        <p>Generated with advanced AI analysis</p>
        <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
          © ${new Date().getFullYear()} All rights reserved
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
  }

  /**
   * Sends an email using Resend
   */
  static async sendEmail(options: EmailOptions, content: string): Promise<any> {
    const { to, subject, isTest = false } = options
    const htmlContent = this.convertMarkdownToHtml(content)
    const emailTemplate = this.createEmailTemplate(htmlContent, isTest)

    return await resend.emails.send({
      from: 'Weekly Digest <noreply@updates.fitzsixto.com>',
      to,
      subject: isTest ? `[TEST] ${subject}` : subject,
      html: emailTemplate,
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
    metadata?: any
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