import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
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
    } catch (error) {
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

    // Format the content for email
    const markdownContent = `# AI Analysis Report

**Generated:** ${new Date().toLocaleString()}
**Model:** GPT-4o Mini

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
      html: `<html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            h2 { color: #1f2937; margin-top: 30px; }
            .metadata { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
            .metadata p { margin: 5px 0; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>AI Analysis Report</h1>
            <div class="metadata">
              <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Model:</strong> GPT-4o Mini</p>
            </div>
            <div class="content">
              <h2>Analysis</h2>
              <div>${aiResponse.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              <p><em>This analysis was generated using the current system prompt configuration.</em></p>
              <p><em>Bi-Weekly Digest - AI-Powered Content Assistant</em></p>
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