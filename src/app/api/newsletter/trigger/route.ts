import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Test email recipients
const TEST_RECIPIENTS = [
  'kulaizke@gmail.com',
  'arisantonioco@gmail.com'
]

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'kyle@zaigo.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the system prompt configuration
    const { data: config, error: configError } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()

    if (configError || !config) {
      console.error('Failed to fetch configuration:', configError)
      return NextResponse.json({ error: 'Configuration not found' }, { status: 500 })
    }

    // Generate AI content
    let aiResponse = ''
    
    try {
      // Remove content restrictions from system prompt if present
      let systemPrompt = config.system_prompt || ''
      if (systemPrompt.includes('CONTENT RESTRICTION POLICY:')) {
        const parts = systemPrompt.split('Core Analytical Framework:')
        if (parts.length > 1) {
          systemPrompt = 'Core Analytical Framework:' + parts[1]
        }
      }

      // Try Responses API first
      try {
        const response = await openai.responses.create({
          model: 'gpt-4o-mini',
          temperature: 0.45,
          instructions: systemPrompt,
          input: 'Generate comprehensive investment analysis content based on current market data.',
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
              content: systemPrompt 
            },
            {
              role: 'user',
              content: 'Generate comprehensive investment analysis content.'
            }
          ],
          max_tokens: 8000,
        })
        
        aiResponse = completion.choices[0].message.content || 'No response generated'
      }
    } catch (error) {
      console.error('Failed to generate AI content:', error)
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }

    // Convert markdown to HTML for email
    const markdownHtml = convertMarkdownToHtml(aiResponse)

    // Send email to test recipients
    const emailPromises = TEST_RECIPIENTS.map(email => 
      sendManualTestEmail(email, markdownHtml, aiResponse)
    )

    const results = await Promise.allSettled(emailPromises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failureCount = results.filter(r => r.status === 'rejected').length

    // Store in blogs table with manual test flag
    await supabase
      .from('blogs')
      .insert({
        title: `[MANUAL TEST] Weekly Investment Analysis - ${new Date().toLocaleDateString()}`,
        content: aiResponse,
      })

    return NextResponse.json({
      success: true,
      message: `Manual test sent to ${successCount} recipients (${TEST_RECIPIENTS.join(', ')})`,
      stats: {
        totalRecipients: TEST_RECIPIENTS.length,
        successfulSends: successCount,
        failedSends: failureCount
      }
    })

  } catch (error) {
    console.error('Manual trigger error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function sendManualTestEmail(email: string, htmlContent: string, markdownContent: string) {
  const emailResult = await resend.emails.send({
    from: 'Weekly Digest <noreply@updates.fitzsixto.com>',
    to: email,
    subject: `[MANUAL TEST] AI Investment Analysis - ${new Date().toLocaleDateString()}`,
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
    .manual-banner {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 16px;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
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
    .test-info {
      background: #eff6ff;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 12px;
      margin: 16px 32px;
      text-align: center;
      color: #1e40af;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="manual-banner">
        🚀 MANUAL TEST - Triggered from Admin Panel
      </div>
      
      <div class="header">
        <h1>AI Investment Analysis</h1>
        <p>Your weekly investment insights (MANUAL TEST)</p>
      </div>
      
      <div class="test-info">
        <strong>Manual Test:</strong> This email was manually triggered from the admin panel. 
        This helps verify the newsletter system is working correctly before scheduled sends.
      </div>
      
      <div class="analysis-section">
        <div class="content">
          ${htmlContent}
        </div>
      </div>
      
      <div class="footer">
        <p>Manually triggered test email - Not part of scheduled delivery</p>
        <p>Test Recipients: ${TEST_RECIPIENTS.join(', ')}</p>
        <p class="footer-logo">Weekly Digest - Manual Test</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text: markdownContent,
  })

  if (emailResult.error) {
    throw emailResult.error
  }

  return emailResult
}

function convertMarkdownToHtml(markdown: string): string {
  let html = markdown

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
    .replace(/^[\*\-•]\s+(.+)$/gim, '<li style="margin-bottom: 8px; line-height: 1.7; color: #4b5563;"><span style="color: #374151;">•</span> $1</li>')
    
  // Wrap list items in ul tags
  const lines = html.split('\n')
  const processedLines: string[] = []
  let inList = false
  
  for (const line of lines) {
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
  
  if (inList) {
    processedLines.push('</ul>')
  }
  
  html = processedLines.join('\n')
  
  // Paragraphs
  html = html
    .split('\n\n')
    .map(para => {
      para = para.trim()
      if (para && !para.includes('<h') && !para.includes('<ul') && !para.includes('<li')) {
        return `<p style="margin-bottom: 16px; line-height: 1.7; color: #4b5563;">${para}</p>`
      }
      return para
    })
    .join('\n\n')
  
  return html
}