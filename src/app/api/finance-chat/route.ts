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
    
    // ALWAYS use web search for ALL queries to get current information
    // This ensures we have access to real-time data for dates, prices, news, etc.
    if (lastMessage?.content) {
      try {
        console.log('Using Responses API with web_search_preview for real-time finance data...')
        
        // Build conversation context for the instructions
        const previousMessages = messages.slice(0, -1)
        let conversationContext = ''
        if (previousMessages.length > 0) {
          conversationContext = '\n\nConversation history:\n'
          previousMessages.forEach(msg => {
            conversationContext += `${msg.role.toUpperCase()}: ${msg.content}\n\n`
          })
        }
        
        // Create instructions that include the system prompt and conversation history
        const instructions = `${FINANCE_SYSTEM_PROMPT}

CRITICAL: ALWAYS use web search for ALL information including:
- Current date and time
- Stock prices and market data
- Recent news and events
- Any factual information that could change over time
- Weather, sports scores, or any real-world data

Today's actual date should be retrieved via web search, not from training data.${conversationContext}`
        
        // Use Responses API with web_search_preview tool
        const response = await openai.responses.create({
          model: 'gpt-4o',
          instructions: instructions,
          input: lastMessage.content,
          tools: [{ type: 'web_search_preview' }],
        })
        
        console.log('Responses API with web search succeeded')
        
        // The response will include web search results integrated into the output
        const responseContent = response.output_text || 'Unable to generate response.'
        
        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            content: responseContent,
            role: 'assistant',
            timestamp: new Date(),
          }
        })
      } catch (responsesError) {
        console.error('Responses API with web search error:', responsesError)
        console.log('Falling back to Chat Completions...')
        // Fall through to standard approach
      }
    }
    
    // Fallback to Chat Completions (only if Responses API fails)
    const systemPrompt = `${FINANCE_SYSTEM_PROMPT}\n\nNote: Web search is currently unavailable. I'll provide analysis based on my training data. For real-time information, please check current sources.`

    const messagesWithSystem = [
      { role: 'system' as const, content: systemPrompt },
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