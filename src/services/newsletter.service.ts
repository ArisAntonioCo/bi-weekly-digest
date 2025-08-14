import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'
import OpenAI from 'openai'
import type { SupabaseClient } from '@supabase/supabase-js'

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
  static async getConfiguration(supabaseClient?: SupabaseClient) {
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
   * Cleans web search artifacts from content
   */
  static cleanWebSearchContent(content: string): string {
    let cleaned = content
    
    // Remove markdown links but keep the text: [text](url) -> text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    
    // Remove any parenthetical URLs or domain references like (example.com) or (www.example.com)
    cleaned = cleaned.replace(/\s*\([^)]*\.(com|org|net|io|gov|edu|co|uk|ai|app|dev|tech|info|biz)[^)]*\)/g, '')
    
    // Remove plain URLs
    cleaned = cleaned.replace(/https?:\/\/[^\s\)]+/g, '')
    
    // Remove reference markers like [1], [2], etc.
    cleaned = cleaned.replace(/\[\d+\]/g, '')
    
    // Remove any remaining domain-like patterns
    cleaned = cleaned.replace(/\b[\w-]+\.(com|org|net|io|gov|edu|co|uk|ai|app|dev|tech|info|biz)\b/g, '')
    
    // Look for the Summary Judgment section and cut off anything after it
    const summaryJudgmentMatch = cleaned.match(/##?\s*Summary Judgment.*?\n\n.*?(?=\n\n##|\n\n[A-Z]|$)/s)
    if (summaryJudgmentMatch) {
      // Find where the Summary Judgment section ends (next section or excessive newlines)
      const summaryEndIndex = cleaned.indexOf(summaryJudgmentMatch[0]) + summaryJudgmentMatch[0].length
      
      // Check if there's content after that looks like web search additions
      const afterSummary = cleaned.substring(summaryEndIndex).trim()
      
      // If the content after contains patterns like "AI Initiatives", "Market Position", etc.
      // that aren't part of the standard framework sections, cut it off
      if (afterSummary && (
        afterSummary.includes('AI Initiative') ||
        afterSummary.includes('Market Position') ||
        afterSummary.includes('Latest News') ||
        afterSummary.includes('Recent Development') ||
        afterSummary.includes('Breaking:') ||
        afterSummary.includes('Update:') ||
        afterSummary.match(/^#{1,2}\s*[A-Z].*?:$/m) // Headers with colons that look like news sections
      )) {
        // Cut off everything after Summary Judgment
        cleaned = cleaned.substring(0, summaryEndIndex).trim()
      }
    }
    
    // Remove lines that start with common citation patterns
    const lines = cleaned.split('\n')
    const filteredLines = lines.filter(line => {
      const trimmedLine = line.trim().toLowerCase()
      // Remove lines that are citations or metadata
      if (trimmedLine.startsWith('source:') || 
          trimmedLine.startsWith('citation:') ||
          trimmedLine.startsWith('reference:') ||
          trimmedLine.startsWith('stock market information for') ||
          trimmedLine.startsWith('market data from') ||
          trimmedLine.startsWith('data source:') ||
          trimmedLine.startsWith('retrieved from:') ||
          trimmedLine.startsWith('accessed:') ||
          trimmedLine.startsWith('via:') ||
          trimmedLine.startsWith('from:')) {
        return false
      }
      return true
    })
    
    cleaned = filteredLines.join('\n')
    
    // Remove any trailing metadata sections (usually after multiple newlines at the end)
    const parts = cleaned.split(/\n{3,}/)
    if (parts.length > 1) {
      // Check if the last part looks like metadata/citations or web search additions
      const lastPart = parts[parts.length - 1]
      const lastPartLower = lastPart.toLowerCase()
      if (lastPartLower.includes('source') || 
          lastPartLower.includes('citation') || 
          lastPartLower.includes('reference') ||
          lastPartLower.includes('stock market information') ||
          lastPartLower.includes('data from') ||
          lastPart.includes('Initiative') ||
          lastPart.includes('Latest') ||
          lastPart.includes('Breaking')) {
        parts.pop()
        cleaned = parts.join('\n\n')
      }
    }
    
    // Clean up any double periods that might result from removing domains
    cleaned = cleaned.replace(/\.\./g, '.')
    
    // Clean up excessive whitespace
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n')
    
    return cleaned.trim()
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
          model: 'gpt-4o',
          input: systemPrompt,
          tools: [{ type: 'web_search_preview' }],
        })
        
        console.log('Responses API with web search succeeded for newsletter')
        
        // Clean the response to remove web search artifacts
        const rawContent = response.output_text || 'No response generated'
        return this.cleanWebSearchContent(rawContent)
      } catch (responsesError) {
        console.error('Responses API with web search error:', responsesError)
        console.log('Falling back to Chat Completions...')
        
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
    let html = markdown
    
    // Convert markdown links to HTML with brand green color
    // Handle inline links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2ee700; text-decoration: none; font-weight: 500; border-bottom: 1px solid transparent;">$1</a>')
    
    // Handle reference-style links: [text][ref] and [ref]: url
    const refLinks: { [key: string]: string } = {}
    html = html.replace(/^\[([^\]]+)\]:\s*(.+)$/gm, (match, ref, url) => {
      refLinks[ref.toLowerCase()] = url.trim()
      return '' // Remove reference definitions from output
    })
    
    // Replace reference-style link usages
    html = html.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, (match, text, ref) => {
      const refKey = (ref || text).toLowerCase()
      const url = refLinks[refKey]
      if (url) {
        return `<a href="${url}" style="color: #2ee700; text-decoration: none; font-weight: 500; border-bottom: 1px solid transparent;">${text}</a>`
      }
      return match // Keep original if no reference found
    })
    
    // Handle tables properly
    const tableRegex = /\|.*\|\n\|[-:\s|]+\|\n(?:\|.*\|\n?)+/gm
    
    html = html.replace(tableRegex, (tableMatch) => {
      const lines = tableMatch.trim().split('\n')
      const headers = lines[0].split('|').filter(h => h.trim()).map(h => h.trim())
      const rows = lines.slice(2).map(line => 
        line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      )
      
      let tableHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0; margin: 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f9fafb;">`
      
      headers.forEach((header, index) => {
        tableHtml += `
              <th style="padding: 12px 16px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #111827; text-align: left; border-bottom: 2px solid #e5e7eb; ${index === 0 ? 'border-left: 3px solid #2ee700;' : ''}">${header}</th>`
      })
      
      tableHtml += `
            </tr>
          </thead>
          <tbody>`
      
      rows.forEach((row, rowIndex) => {
        const bgColor = rowIndex % 2 === 0 ? '#ffffff' : '#fafafa'
        tableHtml += `
            <tr style="background-color: ${bgColor};">`
        
        row.forEach((cell, cellIndex) => {
          // Base cell styling
          let cellStyle = `padding: 12px 16px; font-size: 14px; color: #4b5563; border-bottom: 1px solid #f3f4f6;`
          
          // Add left border accent for first column
          if (cellIndex === 0) {
            cellStyle += ' border-left: 3px solid #2ee700;'
          }
          
          tableHtml += `
              <td style="${cellStyle}">${cell}</td>`
        })
        
        tableHtml += `
            </tr>`
      })
      
      tableHtml += `
          </tbody>
        </table>`
      
      return tableHtml
    })
    
    // Headers with modern styling
    html = html
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; margin-top: 20px; color: #374151;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 22px; font-weight: 700; margin-bottom: 16px; margin-top: 28px; color: #111827; display: flex; align-items: center;"><span style="display: inline-block; width: 4px; height: 24px; background: #2ee700; margin-right: 12px;"></span>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 28px; font-weight: 800; margin-bottom: 20px; margin-top: 32px; color: #000000; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px;">$1</h1>')
      
    // Bold and italic with enhanced styling
    html = html
      .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 700; color: #111827;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="font-style: italic; color: #4b5563;">$1</em>')
      
    // Lists with better spacing
    html = html
      .replace(/^[\*\-•]\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;">$1</li>')
      .replace(/^\d+\.\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;">$1</li>')
    
    // Wrap list items in ul tags with modern styling
    const lines = html.split('\n')
    const processedLines: string[] = []
    let inList = false
    
    for (const line of lines) {
      if (line.includes('<li')) {
        if (!inList) {
          processedLines.push('<ul style="margin-bottom: 20px; padding-left: 24px;">')
          inList = true
        }
        // Keep standard list item without custom bullet
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
    
    // Paragraphs with enhanced styling
    html = html
      .split('\n\n')
      .map(para => {
        para = para.trim()
        if (para && !para.includes('<h') && !para.includes('<ul') && !para.includes('<li') && !para.includes('<table')) {
          // Check if paragraph contains key metrics or important numbers
          if (para.includes('MOIC') || para.includes('%') || para.includes('$')) {
            return `<p style="margin-bottom: 16px; line-height: 1.7; color: #374151; font-weight: 500; background: #f9fafb; padding: 16px; border-left: 3px solid #2ee700; border-radius: 4px;">${para}</p>`
          }
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
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      background-color: #f3f4f6;
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
      background: #ffffff;
      border-top: 4px solid #2ee700;
      padding: 40px 32px;
      margin: 0;
      position: relative;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
    }
    .header-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.03;
      background-image: repeating-linear-gradient(
        45deg,
        #000000,
        #000000 1px,
        transparent 1px,
        transparent 15px
      );
      pointer-events: none;
    }
    .brand-logo {
      font-size: 32px;
      font-weight: 900;
      color: #000000;
      letter-spacing: -0.02em;
      margin: 0 auto;
      text-align: center;
      display: block;
    }
    .brand-logo .mode-text {
      color: #000000;
    }
    .brand-logo .three-y {
      display: inline-block;
      background: linear-gradient(135deg, #2ee700 0%, #25c200 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 900;
    }
    .header-tagline {
      color: #6b7280;
      font-size: 14px;
      margin-top: 8px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-weight: 500;
    }
    .analysis-section {
      padding: 40px 32px;
    }
    .content {
      color: #374151;
    }
    .content h1 {
      color: #000000;
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 20px;
      margin-top: 32px;
      border-bottom: 2px solid #f3f4f6;
      padding-bottom: 12px;
    }
    .content h2 {
      color: #111827;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 16px;
      margin-top: 28px;
      display: flex;
      align-items: center;
    }
    .content h2::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 24px;
      background: #2ee700;
      margin-right: 12px;
    }
    .content h3 {
      color: #374151;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      margin-top: 20px;
    }
    .content p {
      color: #4b5563;
      line-height: 1.7;
      margin-bottom: 16px;
    }
    .content a {
      color: #2ee700;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }
    .content a:hover {
      border-bottom-color: #2ee700;
    }
    .content strong {
      color: #111827;
      font-weight: 700;
    }
    .content ul, .content ol {
      padding-left: 24px;
      margin-bottom: 20px;
    }
    .content li {
      color: #4b5563;
      margin-bottom: 8px;
      line-height: 1.7;
    }
    .metric-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-left: 4px solid #2ee700;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .metric-card-title {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .metric-card-value {
      font-size: 28px;
      font-weight: 800;
      color: #000000;
    }
    .metric-positive {
      color: #2ee700;
    }
    .metric-negative {
      color: #ef4444;
    }
    .cta-button {
      display: inline-block;
      background: #2ee700;
      color: #000000;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 9999px;
      text-decoration: none;
      margin: 20px 0;
      font-size: 16px;
      letter-spacing: -0.01em;
    }
    .footer {
      padding: 32px;
      background-color: #000000;
      color: #ffffff;
      text-align: center;
    }
    .footer-content {
      max-width: 600px;
      margin: 0 auto;
    }
    .footer-logo {
      font-weight: 700;
      color: #ffffff;
      font-size: 18px;
      margin-bottom: 12px;
    }
    .footer-logo .highlight {
      color: #2ee700;
    }
    .footer p {
      margin: 8px 0;
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.5;
    }
    .footer-disclaimer {
      margin-top: 20px;
      font-size: 11px;
      color: #6b7280;
      line-height: 1.4;
    }
    /* Table styling */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 24px 0;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    table thead {
      background: #f9fafb;
    }
    table th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #111827;
      border-bottom: 2px solid #e5e7eb;
    }
    table td {
      padding: 12px 16px;
      color: #4b5563;
      font-size: 14px;
      border-bottom: 1px solid #f3f4f6;
    }
    table tbody tr:hover {
      background: #f9fafb;
    }
    table tbody tr:last-child td {
      border-bottom: none;
    }
    /* Responsive adjustments */
    @media (max-width: 600px) {
      .header {
        padding: 24px 20px;
      }
      .brand-logo {
        font-size: 26px;
      }
      .analysis-section {
        padding: 24px 20px;
      }
      .content h1 {
        font-size: 24px;
      }
      .content h2 {
        font-size: 20px;
      }
      .footer {
        padding: 24px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-pattern"></div>
        <h1 class="brand-logo" style="text-align: center; margin: 0; font-size: 32px; line-height: 1.2;">
          <img src="https://bi-weekly-digest-4xcy.vercel.app/3YMode.png" alt="3YMode Logo" style="height: 35px; width: auto; vertical-align: middle; display: inline-block; margin-right: 12px;" />
          <span style="vertical-align: middle;">
            <span class="three-y">3Y</span><span class="mode-text">Mode</span>
          </span>
        </h1>
        <p class="header-tagline">Expert-Grade MOIC Projections</p>
      </div>
      
      <div class="analysis-section">
        <div class="content">
          ${content}
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-content">
          <div class="footer-logo">
            <span class="highlight">3Y</span>Mode
          </div>
          <p>AI-Powered Investment Analysis</p>
          <p>Leveraging frameworks from world-class investors</p>
          
          
          <div class="footer-disclaimer">
            This newsletter is for informational purposes only and does not constitute financial advice. 
            Always conduct your own research before making investment decisions.
            <br><br>
            © ${new Date().getFullYear()} 3YMode. All rights reserved.
          </div>
        </div>
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
    const { to, subject } = options
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
**Model:** gpt-4o with Web Search
**Type:** ${analysisType.type}

## Analysis

${content}

---

*This analysis was generated using AI-powered investment research.*
*Weekly Digest - AI-Powered Content Assistant*`

    return await resend.emails.send({
      from: 'Weekly Digest <noreply@updates.fitzsixto.com>',
      to,
      subject,
      html: emailTemplate,
      text: markdownContent,
    })
  }

  /**
   * Stores the newsletter content in the database
   */
  static async storeNewsletter(content: string, title?: string, supabaseClient?: SupabaseClient): Promise<void> {
    const supabase = supabaseClient || await createClient()
    
    // Extract company name or ticker from content for better title generation
    const extractCompanyInfo = (text: string): string => {
      // Look for patterns like "For APPLE (AAPL)" or "## What [Company Name] Does"
      const tickerMatch = text.match(/For\s+([A-Z][A-Za-z\s&]+)\s*\(([A-Z]+)\)/i)
      const companyMatch = text.match(/##\s*What\s+([A-Za-z\s&]+)\s+Does/i)
      
      if (tickerMatch) {
        return `${tickerMatch[1].trim()} (${tickerMatch[2]})`
      } else if (companyMatch) {
        return companyMatch[1].trim()
      }
      
      // Fallback: look for common company names in the content
      const companies = ['Apple', 'Microsoft', 'Google', 'Amazon', 'Tesla', 'NVIDIA', 'Meta', 'Netflix']
      for (const company of companies) {
        if (text.includes(company)) {
          return company
        }
      }
      
      return 'Investment'
    }
    
    const companyInfo = extractCompanyInfo(content)
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
}