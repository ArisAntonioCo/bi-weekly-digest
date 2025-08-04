import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST() {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the system prompt from configurations
    const { data: config, error: fetchError } = await supabase
      .from('configurations')
      .select('*')
      .single()

    if (fetchError || !config) {
      return NextResponse.json({ 
        error: 'Failed to fetch system prompt configuration' 
      }, { status: 500 })
    }

    let aiResponse = ''
    
    try {
      // Try to use the Responses API with web search for current data
      const response = await openai.responses.create({
        model: 'gpt-4o-mini',
        instructions: config.system_prompt,
        input: 'Based on your expertise and current market conditions, provide your top investment recommendations or analysis. Include specific companies, MOICs, or market insights. Use web search to get the latest stock prices and market data. Be detailed and actionable.',
        tools: [{ type: 'web_search_preview' }],
      })
      
      aiResponse = response.output_text || 'No response generated'
    } catch {
      console.log('Responses API failed, falling back to Chat Completions')
      
      // Fallback to regular chat completions
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: config.system_prompt 
          },
          {
            role: 'user',
            content: 'Based on your expertise and current market conditions, provide your top investment recommendations or analysis. Include specific companies, MOICs, or market insights. Be detailed and actionable. Note: Real-time data is not available, so provide analysis based on your training data.'
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
      
      aiResponse = completion.choices[0].message.content || 'No response generated'
    }

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

    const analysisType = getAnalysisType(aiResponse)
    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })

    // Simple markdown to HTML conversion
    const convertMarkdownToHtml = (markdown: string) => {
      // First, handle emoji shortcodes
      const emojiMap: Record<string, string> = {
        ':chart_with_upwards_trend:': '📈',
        ':chart_with_downwards_trend:': '📉',
        ':white_check_mark:': '✅',
        ':mortar_board:': '🎓',
        ':bar_chart:': '📊',
        ':brain:': '🧠',
        ':sleuth_or_spy:': '🔍',
        ':large_green_circle:': '',
        ':large_yellow_circle:': '',
        ':red_circle:': '',
      }
      
      let html = markdown
      
      // Replace emoji shortcodes
      Object.entries(emojiMap).forEach(([code, emoji]) => {
        html = html.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji)
      })
      
      // Pre-process to handle inline lists (e.g., "Risk Vectors: - Item 1 - Item 2")
      html = html.replace(/^(.+?):\s*-\s*(.+)$/gm, (match, prefix) => {
        const items = match.substring(match.indexOf('- '))
          .split(/\s*-\s*/)
          .filter(item => item.trim())
          .map(item => `\n• ${item.trim()}`)
          .join('')
        return `${prefix}:${items}`
      })
      
      html = html
        // Headers
        .replace(/^### (.*$)/gim, '<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px; margin-top: 16px; color: #374151;">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; margin-top: 20px; color: #1f2937;">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; margin-top: 24px; color: #111827;">$1</h1>')
        
        // Links - handle markdown links [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #111827; text-decoration: underline; font-weight: 600;">$1</a>')
        
        // Bold text - use negative lookahead to avoid matching italic markers
        .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 600; color: #111827;">$1</strong>')
        
        // Italic text - only match single asterisks not part of bold
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em style="font-style: italic;">$1</em>')
        
        // Code blocks
        .replace(/`([^`]+)`/g, '<code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: monospace;">$1</code>')
        
        // Lists - handle various bullet formats
        .replace(/^[\*\-]\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;">$1</li>')
        .replace(/^•\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;">$1</li>')
        .replace(/^\d+\.\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;">$1</li>')
      
      // Process the HTML to wrap list items in ul/ol tags
      const lines = html.split('\n')
      const processedLines: string[] = []
      let inList = false
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        if (line.includes('<li')) {
          if (!inList) {
            processedLines.push('<ul style="margin-bottom: 16px; padding-left: 24px; list-style-type: disc;">')
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
      
      // Close list if still open at the end
      if (inList) {
        processedLines.push('</ul>')
      }
      
      html = processedLines.join('\n')
      
      // Handle paragraphs
      html = html
        .split('\n\n')
        .map(para => {
          para = para.trim()
          if (para && !para.includes('<h') && !para.includes('<ul') && !para.includes('<ol') && !para.includes('<li')) {
            return `<p style="margin-bottom: 16px; line-height: 1.7; color: #4b5563;">${para}</p>`
          }
          return para
        })
        .join('\n\n')
      
      return html
    }

    const markdownHtml = convertMarkdownToHtml(aiResponse)

    // Format the content for email
    const markdownContent = `# AI Analysis Report

**Generated:** ${new Date().toLocaleString()}
**Model:** GPT-4o Mini
**Type:** ${analysisType.type}

## Analysis

${aiResponse}

---

*This analysis was generated using the current system prompt configuration.*
*Bi-Weekly Digest - AI-Powered Content Assistant*
`

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'Bi-Weekly Digest <onboarding@resend.dev>',
      to: 'kulaizke@gmail.com',
      subject: 'AI Analysis Report - Bi-Weekly Digest',
      html: `<!DOCTYPE html>
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
      background: linear-gradient(135deg, #111827 0%, #374151 100%);
      color: white;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .metadata {
      padding: 24px 32px;
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .metadata-item {
      text-align: center;
    }
    .metadata-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .metadata-value {
      font-size: 14px;
      color: #111827;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      background-color: ${analysisType.color}20;
      color: ${analysisType.color};
    }
    .analysis-section {
      padding: 32px;
    }
    .analysis-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
    }
    .analysis-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
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
      .metadata {
        padding: 20px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>AI Analysis Report</h1>
        <p>Your bi-weekly investment insights</p>
      </div>
      
      <div class="metadata">
        <div class="metadata-grid">
          <div class="metadata-item">
            <div class="metadata-label">Generated</div>
            <div class="metadata-value">${formattedDate}</div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Analysis Type</div>
            <div class="metadata-value">
              <span class="badge">${analysisType.type}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="analysis-section">
        <div class="analysis-header">
          <h2>Latest Analysis</h2>
        </div>
        <div class="content">
          ${markdownHtml}
        </div>
      </div>
      
      <div class="footer">
        <p>This analysis was generated using AI-powered investment research</p>
        <p class="footer-logo">Bi-Weekly Digest</p>
      </div>
    </div>
  </div>
</body>
</html>`,
      text: markdownContent,
    })

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
      return NextResponse.json({ 
        error: 'Failed to send email' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'System prompt has been emailed successfully!',
      emailId: emailResult.data?.id
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process email request' 
    }, { status: 500 })
  }
}