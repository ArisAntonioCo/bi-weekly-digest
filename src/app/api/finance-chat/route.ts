import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Finance-specific system prompt
const FINANCE_SYSTEM_PROMPT = `You are an AI Finance Assistant specializing in investment analysis, particularly in 3-year Forward MOIC (Multiple on Invested Capital) projections. 

Your expertise includes:
- Stock market analysis and valuation
- MOIC calculations and projections
- Financial metrics and ratios
- Investment strategy and portfolio management
- Market trends and sector analysis
- Risk assessment and management

When discussing MOIC projections:
- Explain calculations clearly
- Consider multiple scenarios (base, bull, bear cases)
- Factor in industry trends and competitive positioning
- Provide data-driven insights
- Include relevant financial metrics

IMPORTANT - Mathematical Formatting Guidelines:
- NEVER use square brackets [ ] for math equations
- For inline math: Use single dollar signs $equation$
- For display math (on its own line): Use double dollar signs $$equation$$
- Examples:
  - WRONG: [ \text{MOIC} = \frac{180.77}{49.33} ]
  - RIGHT for display: $$\text{MOIC} = \frac{180.77}{49.33}$$
  - RIGHT for inline: The MOIC is $\text{MOIC} = \frac{180.77}{49.33} \approx 3.66$
- Use LaTeX commands with single backslash: \text{}, \frac{}, \approx
- DO NOT escape dollar signs - write $ not \$

Be analytical, precise, and data-driven in your responses. Use actual market data when available through web search.`

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    
    // Check if the message requires real-time financial data
    const needsFinancialData = lastMessage?.content && (
      lastMessage.content.toLowerCase().includes('stock') ||
      lastMessage.content.toLowerCase().includes('price') ||
      lastMessage.content.toLowerCase().includes('moic') ||
      lastMessage.content.toLowerCase().includes('market') ||
      lastMessage.content.toLowerCase().includes('earnings') ||
      lastMessage.content.toLowerCase().includes('valuation') ||
      lastMessage.content.toLowerCase().includes('analysis') ||
      lastMessage.content.toLowerCase().includes('projection') ||
      lastMessage.content.toLowerCase().includes('forward') ||
      /\b[A-Z]{1,5}\b/.test(lastMessage.content) // Stock ticker pattern
    )

    try {
      // Use the Responses API with web search for financial data
      if (needsFinancialData) {
        // Build conversation history
        const conversationHistory = messages.slice(0, -1).map(msg => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n\n')

        const instructions = `${FINANCE_SYSTEM_PROMPT}

Previous conversation:
${conversationHistory}

Use the web search tool to find the latest financial information, stock prices, market data, and company financials when answering questions. Provide specific numbers and data points when available.`

        const response = await openai.responses.create({
          model: 'gpt-4o',
          temperature: 0.45,
          instructions: instructions,
          input: lastMessage.content,
          tools: [{ type: 'web_search_preview' }],
        })

        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            content: response.output_text || 'I apologize, but I was unable to generate a response.',
            role: 'assistant',
            timestamp: new Date(),
          }
        })
      } else {
        // For general finance questions that don't need real-time data
        const messagesWithSystem = [
          { role: 'system' as const, content: FINANCE_SYSTEM_PROMPT },
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          }))
        ]

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messagesWithSystem,
          temperature: 0.45,
          max_tokens: 8000,
        })

        const assistantMessage = completion.choices[0].message

        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            content: assistantMessage.content || '',
            role: 'assistant',
            timestamp: new Date(),
          }
        })
      }
    } catch (apiError: unknown) {
      // Fallback to chat completions if Responses API fails
      console.log('Responses API failed, falling back to Chat Completions:', apiError instanceof Error ? apiError.message : 'Unknown error')
      
      const fallbackSystemPrompt = `${FINANCE_SYSTEM_PROMPT}

Note: Real-time financial data is currently unavailable. I'll provide analysis based on my training data and financial principles.

Remember to use proper LaTeX formatting:
- Inline math: $equation$
- Display math: $$equation$$
- Never use [ ] brackets for math`

      const messagesWithSystem = [
        { role: 'system' as const, content: fallbackSystemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        }))
      ]

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messagesWithSystem,
        temperature: 0.45,
        max_tokens: 8000,
      })

      const assistantMessage = completion.choices[0].message

      return NextResponse.json({
        message: {
          id: Date.now().toString(),
          content: assistantMessage.content || '',
          role: 'assistant',
          timestamp: new Date(),
        }
      })
    }
  } catch (error) {
    console.error('Finance Chat API error:', error)
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}