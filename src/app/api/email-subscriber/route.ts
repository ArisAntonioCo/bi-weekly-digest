import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // Check authentication and user permissions
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'kyle@zaigo.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the email from request body
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
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

    const currentDate = new Date()

    let aiResponse = ''
    
    try {
      // Use Responses API with focused analysis
      const response = await openai.responses.create({
        model: 'gpt-4o-mini',
        temperature: 0.45,
        instructions: config.system_prompt,
        input: 'Use web search to get the latest market data and provide your analysis.',
        tools: [{ type: 'web_search_preview' }],
      })
      
      aiResponse = response.output_text || 'No response generated'
    } catch {
      console.log('Responses API failed, falling back to Chat Completions')
      
      // Fallback to regular chat completions
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.45,
        messages: [
          { 
            role: 'system', 
            content: config.system_prompt
          },
          {
            role: 'user',
            content: 'Provide your analysis based on your expertise and current market conditions.'
          }
        ],
        max_tokens: 8000,
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
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })

    // Enhanced markdown to HTML conversion
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
        ':large_green_circle:': '🟢',
        ':large_yellow_circle:': '🟡',
        ':red_circle:': '🔴',
      }
      
      let html = markdown
      
      // Replace emoji shortcodes
      Object.entries(emojiMap).forEach(([code, emoji]) => {
        html = html.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji)
      })
      
      // Handle tables (simple pipe-separated tables)
      const tableRows: string[] = []
      let inTable = false
      let isFirstRow = true
      
      html = html.replace(/^\|(.*)\|$/gm, (match) => {
        const cells = match.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
        const isHeaderSeparator = cells.every(cell => /^-+$/.test(cell.replace(/:/g, '')))
        
        if (isHeaderSeparator) {
          return '<!--separator-->' // Mark separator for removal
        }
        
        inTable = true
        const cellTag = isFirstRow ? 'th' : 'td'
        const cellStyle = isFirstRow 
          ? 'padding: 12px 16px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #374151;'
          : 'padding: 10px 16px; border: 1px solid #e5e7eb; font-size: 14px; color: #4b5563;'
        
        const cellTags = cells.map(cell => 
          `<${cellTag} style="${cellStyle}">${cell}</${cellTag}>`
        ).join('')
        
        if (isFirstRow) {
          isFirstRow = false
          return `<thead><tr style="background-color: #f9fafb;">${cellTags}</tr></thead><tbody>`
        }
        
        return `<tr style="background-color: white; border-bottom: 1px solid #e5e7eb;">${cellTags}</tr>`
      })
      
      // Clean up separators and wrap tables
      html = html.replace(/<!--separator-->/g, '')
      
      // Wrap table rows in proper table structure with enhanced styling
      html = html.replace(/(<thead>.*<\/tbody>)/gs, (match) => {
        return `
          <div style="margin: 20px 0; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
              ${match}</tbody>
            </table>
          </div>
        `
      })
      
      // Pre-process to handle inline lists and fix dash bullets
      html = html.replace(/^(.+?):\s*-\s*(.+)$/gm, (match, prefix) => {
        const items = match.substring(match.indexOf('- '))
          .split(/\s*-\s*/)
          .filter(item => item.trim())
          .map(item => `\n• ${item.trim()}`)
          .join('')
        return `${prefix}:${items}`
      })
      
      html = html
        // Headers - make them bold and properly sized
        .replace(/^### (.*$)/gim, '<h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px; margin-top: 16px; color: #111827;">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; margin-top: 20px; color: #111827;">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; margin-top: 24px; color: #111827;">$1</h1>')
        
        // Links - handle markdown links [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #111827; text-decoration: underline; font-weight: 600;">$1</a>')
        
        // Bold text - use negative lookahead to avoid matching italic markers
        .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 700; color: #111827;">$1</strong>')
        
        // Italic text - only match single asterisks not part of bold
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em style="font-style: italic;">$1</em>')
        
        // Code blocks
        .replace(/`([^`]+)`/g, '<code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: monospace;">$1</code>')
        
        // Lists - handle ALL bullet formats including dashes, add bullet character
        .replace(/^[\*\-•]\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;"><span style="color: #374151;">•</span> $1</li>')
        .replace(/^\d+\.\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;">$1</li>')
      
      // Process the HTML to wrap list items in ul/ol tags
      const lines = html.split('\n')
      const processedLines: string[] = []
      let inList = false
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        if (line.includes('<li')) {
          if (!inList) {
            processedLines.push('<ul style="margin-bottom: 16px; padding-left: 0; list-style-type: none;">')
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
          if (para && !para.includes('<h') && !para.includes('<ul') && !para.includes('<ol') && !para.includes('<li') && !para.includes('<table')) {
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
*Weekly Digest - AI-Powered Content Assistant*
`

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'Weekly Digest <noreply@updates.fitzsixto.com>',
      to: email,
      subject: 'AI Analysis Report - Weekly Digest',
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
      <div class="header">
        <h1>AI Investment Analysis</h1>
        <p>Your weekly investment insights</p>
      </div>
      
      <div class="analysis-section">
        <div class="content">
          ${markdownHtml}
        </div>
      </div>
      
      <div class="footer">
        <p>This analysis was generated using AI-powered investment research</p>
        <p class="footer-logo">Weekly Digest</p>
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
      message: `AI analysis has been emailed successfully to ${email}!`,
      emailId: emailResult.data?.id
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process email request' 
    }, { status: 500 })
  }
}