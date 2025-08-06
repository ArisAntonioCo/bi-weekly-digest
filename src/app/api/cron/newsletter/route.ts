import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'
import OpenAI from 'openai'
import { NewsletterSchedule } from '@/types/newsletter'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron job or authorized request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get the schedule configuration
    const { data: schedule, error: scheduleError } = await supabase
      .from('newsletter_schedule')
      .select('*')
      .single()

    if (scheduleError || !schedule) {
      console.error('Failed to fetch schedule:', scheduleError)
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // Check if schedule is active
    if (!schedule.is_active) {
      return NextResponse.json({ message: 'Schedule is not active' }, { status: 200 })
    }

    // Check if we should send newsletter today
    const now = new Date()
    const shouldSend = shouldSendNewsletter(schedule, now)

    if (!shouldSend) {
      return NextResponse.json({ 
        message: 'Not scheduled to send today',
        nextScheduled: schedule.next_scheduled_at 
      }, { status: 200 })
    }

    // Get all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('is_active', true)

    if (subscribersError || !subscribers || subscribers.length === 0) {
      console.error('Failed to fetch subscribers:', subscribersError)
      return NextResponse.json({ 
        message: 'No active subscribers found',
        error: subscribersError 
      }, { status: 200 })
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

    // Generate AI content for the newsletter
    let aiResponse = ''
    
    try {
      // Try Responses API first
      try {
        const response = await openai.responses.create({
          model: 'gpt-4o',
          temperature: 0.45,
          instructions: config.system_prompt,
          input: '',
          tools: [{ type: 'web_search_preview' }],
        })
        
        aiResponse = response.output_text || 'No response generated'
      } catch {
        console.log('Responses API failed, falling back to Chat Completions')
        
        // Fallback to regular chat completions
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          temperature: 0.45,
          messages: [
            { 
              role: 'system', 
              content: config.system_prompt 
            },
            {
              role: 'user',
              content: ''
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

    // Send email to all subscribers
    const emailPromises = subscribers.map(subscriber => 
      sendNewsletterEmail(subscriber.email, markdownHtml, aiResponse)
    )

    const results = await Promise.allSettled(emailPromises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failureCount = results.filter(r => r.status === 'rejected').length

    // Update last sent timestamp
    await supabase
      .from('newsletter_schedule')
      .update({ 
        last_sent_at: now.toISOString(),
        next_scheduled_at: calculateNextScheduledDate(schedule, now).toISOString()
      })
      .eq('id', schedule.id)

    // Store the sent newsletter in blogs table
    await supabase
      .from('blogs')
      .insert({
        title: `Weekly Investment Analysis - ${now.toLocaleDateString()}`,
        content: aiResponse,
      })

    return NextResponse.json({
      success: true,
      message: 'Newsletter sent successfully',
      stats: {
        totalSubscribers: subscribers.length,
        successfulSends: successCount,
        failedSends: failureCount
      },
      nextScheduled: calculateNextScheduledDate(schedule, now)
    }, { status: 200 })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function shouldSendNewsletter(schedule: NewsletterSchedule, now: Date): boolean {
  // If never sent before, send now
  if (!schedule.last_sent_at) {
    return true
  }

  const lastSent = new Date(schedule.last_sent_at)
  const daysSinceLastSent = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24))

  switch (schedule.frequency) {
    case 'daily':
      return daysSinceLastSent >= 1
    
    case 'weekly':
      // Check if it's been at least 7 days AND it's the correct day of week
      if (daysSinceLastSent >= 7) {
        return now.getDay() === schedule.day_of_week
      }
      return false
    
    case 'biweekly':
      // Check if it's been at least 14 days AND it's the correct day of week
      if (daysSinceLastSent >= 14) {
        return now.getDay() === schedule.day_of_week
      }
      return false
    
    case 'monthly':
      // Check if it's been at least 28 days AND it's the correct day of month
      if (daysSinceLastSent >= 28) {
        return now.getDate() === schedule.day_of_month
      }
      return false
    
    default:
      return false
  }
}

function calculateNextScheduledDate(schedule: NewsletterSchedule, from: Date): Date {
  const next = new Date(from)
  
  switch (schedule.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      next.setDate(schedule.day_of_month || 1)
      break
  }
  
  // Set the specific time
  next.setHours(schedule.hour)
  next.setMinutes(schedule.minute)
  next.setSeconds(0)
  next.setMilliseconds(0)
  
  return next
}

async function sendNewsletterEmail(email: string, htmlContent: string, markdownContent: string) {
  const emailResult = await resend.emails.send({
    from: 'Weekly Digest <noreply@updates.fitzsixto.com>',
    to: email,
    subject: `AI Investment Analysis - ${new Date().toLocaleDateString()}`,
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
      background: linear-gradient(135deg, #111827 0%, #374151 100%) !important;
      color: #FDFCFA !important;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #FDFCFA !important;
      -webkit-text-fill-color: #FDFCFA !important;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 16px;
      opacity: 1;
      color: #FAF9F7 !important;
      -webkit-text-fill-color: #FAF9F7 !important;
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
    .unsubscribe {
      margin-top: 16px;
      font-size: 11px;
      color: #9ca3af;
    }
    .unsubscribe a {
      color: #6b7280;
      text-decoration: underline;
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
          ${htmlContent}
        </div>
      </div>
      
      <div class="footer">
        <p>This analysis was generated using AI-powered investment research</p>
        <p class="footer-logo">Weekly Digest</p>
        <p class="unsubscribe">
          You're receiving this because you subscribed to our newsletter.
          <br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a>
        </p>
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
