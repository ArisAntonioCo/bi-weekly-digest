import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'

const FOLLOW_UP_DIRECTIVE = `Always conclude your response with a single concise follow-up question that logically continues the conversation.

Guidelines for the follow-up question:
- Keep it specific to the user's latest request and your answer
- Limit it to 12 words or fewer
- Avoid repeating the user's wording verbatim
- Reference the primary ticker(s) or asset(s) discussed using $TICKER format when symbols are available
- The question must begin with either "Would you like me to" or "Do you want me to"
- Do NOT include any labels or extra text before the question
- If no meaningful follow-up exists, use: "Would you like me to help with anything else?"
Example: Would you like me to compare $AAPL with $MSFT next?`

const TICKER_REGEX = /\$[A-Za-z]{1,6}(?:\.[A-Za-z]{1,2})?/g

const extractTickers = (text: string): string[] => {
  if (!text) return []
  const matches = text.match(TICKER_REGEX)
  if (!matches) return []
  const unique = Array.from(new Set(matches.map(match => match.replace('$', '').toUpperCase())))
  return unique
}

const buildDefaultTickerFollowUp = (tickers: string[]): string => {
  if (!tickers.length) {
    return 'Would you like me to help with anything else?'
  }

  const unique = Array.from(new Set(tickers.map(t => t.toUpperCase())))
  if (unique.length === 1) {
    return `Would you like me to outline next steps for $${unique[0]}?`
  }
  if (unique.length === 2) {
    return `Would you like me to compare $${unique[0]} with $${unique[1]} next?`
  }

  const rest = unique.slice(1, 3)
  const restText = rest.length === 1 ? `$${rest[0]}` : `$${rest[0]} and $${rest[1]}`
  return `Would you like me to rank $${unique[0]} versus ${restText} next?`
}

const appendDefaultFollowUp = (text: string, suggestion?: string, tickers: string[] = []) => {
  const followUp = suggestion ?? buildDefaultTickerFollowUp(tickers)
  return `${text}\n\n${followUp}`
}

// Finance-specific system prompt
const FINANCE_SYSTEM_PROMPT = `You are an AI Finance Assistant specializing in investment analysis, particularly in 3-year Forward MOIC (Multiple on Invested Capital) projections. 

Your expertise includes:
- Stock market analysis and valuation
- MOIC calculations and projections
- Financial metrics and ratios
- Investment strategy and portfolio management
- Market trends, sector analysis, and market sentiment
- Risk assessment and management
- Federal Reserve policy, rate decisions, and liquidity conditions

When discussing MOIC projections:
- Explain calculations clearly
- Consider multiple scenarios (base, bull, bear cases)
- Factor in industry trends and competitive positioning
- Incorporate current Federal Reserve actions and macroeconomic sentiment
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

Be analytical, precise, and data-driven in your responses. Use actual market data when available through web search.

${FOLLOW_UP_DIRECTIVE}`

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
    const requestTickers = extractTickers(lastMessage?.content ?? '')
    
    // Check if the query is finance-related or asking for current date/time
    const isFinanceRelated = lastMessage?.content && (
      // Finance and investment keywords
      lastMessage.content.toLowerCase().includes('stock') ||
      lastMessage.content.toLowerCase().includes('price') ||
      lastMessage.content.toLowerCase().includes('moic') ||
      lastMessage.content.toLowerCase().includes('market') ||
      lastMessage.content.toLowerCase().includes('earnings') ||
      lastMessage.content.toLowerCase().includes('valuation') ||
      lastMessage.content.toLowerCase().includes('investment') ||
      lastMessage.content.toLowerCase().includes('portfolio') ||
      lastMessage.content.toLowerCase().includes('dividend') ||
      lastMessage.content.toLowerCase().includes('analysis') ||
      lastMessage.content.toLowerCase().includes('projection') ||
      lastMessage.content.toLowerCase().includes('forward') ||
      lastMessage.content.toLowerCase().includes('trading') ||
      lastMessage.content.toLowerCase().includes('finance') ||
      lastMessage.content.toLowerCase().includes('financial') ||
      lastMessage.content.toLowerCase().includes('economy') ||
      lastMessage.content.toLowerCase().includes('inflation') ||
      lastMessage.content.toLowerCase().includes('interest rate') ||
      lastMessage.content.toLowerCase().includes('revenue') ||
      lastMessage.content.toLowerCase().includes('profit') ||
      lastMessage.content.toLowerCase().includes('loss') ||
      lastMessage.content.toLowerCase().includes('pe ratio') ||
      lastMessage.content.toLowerCase().includes('eps') ||
      lastMessage.content.toLowerCase().includes('ipo') ||
      lastMessage.content.toLowerCase().includes('merger') ||
      lastMessage.content.toLowerCase().includes('acquisition') ||
      lastMessage.content.toLowerCase().includes('crypto') ||
      lastMessage.content.toLowerCase().includes('bitcoin') ||
      lastMessage.content.toLowerCase().includes('ethereum') ||
      lastMessage.content.toLowerCase().includes('bond') ||
      lastMessage.content.toLowerCase().includes('treasury') ||
      lastMessage.content.toLowerCase().includes('fed') ||
      lastMessage.content.toLowerCase().includes('federal reserve') ||
      lastMessage.content.toLowerCase().includes('gdp') ||
      lastMessage.content.toLowerCase().includes('recession') ||
      lastMessage.content.toLowerCase().includes('bull') ||
      lastMessage.content.toLowerCase().includes('bear') ||
      lastMessage.content.toLowerCase().includes('volatility') ||
      lastMessage.content.toLowerCase().includes('option') ||
      lastMessage.content.toLowerCase().includes('future') ||
      lastMessage.content.toLowerCase().includes('commodity') ||
      lastMessage.content.toLowerCase().includes('forex') ||
      lastMessage.content.toLowerCase().includes('currency') ||
      lastMessage.content.toLowerCase().includes('dollar') ||
      lastMessage.content.toLowerCase().includes('euro') ||
      lastMessage.content.toLowerCase().includes('yen') ||
      /\b[A-Z]{1,5}\b/.test(lastMessage.content) || // Stock ticker pattern
      // Date/time related queries
      lastMessage.content.toLowerCase().includes('what day') ||
      lastMessage.content.toLowerCase().includes('what date') ||
      lastMessage.content.toLowerCase().includes('today') ||
      lastMessage.content.toLowerCase().includes('current date') ||
      lastMessage.content.toLowerCase().includes('what time') ||
      lastMessage.content.toLowerCase().includes('now')
    )
    
    // If not finance-related, return a polite redirect message
    if (!isFinanceRelated) {
      return NextResponse.json({
        message: {
          id: Date.now().toString(),
          content: appendDefaultFollowUp(
            "I'm specialized in finance and investment analysis. I can help you with:\n\n- Stock market analysis and valuations\n- MOIC projections and investment calculations\n- Market trends and financial news\n- Portfolio strategies and risk assessment\n- Economic indicators and market conditions\n- Current date and time for market context\n\nPlease ask me a finance-related question, and I'll be happy to help!",
            'Would you like me to suggest a finance topic to explore next?',
            requestTickers
          ),
          role: 'assistant',
          timestamp: new Date(),
        }
      })
    }
    
    // Use web search for finance queries and date/time queries
    if (isFinanceRelated) {
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
        const tickerInstruction = requestTickers.length > 0
          ? `\n\nPrimary tickers to reference in your follow-up question: ${requestTickers.map(t => `$${t}`).join(', ')}.`
          : ''
        const instructions = `${FINANCE_SYSTEM_PROMPT}${tickerInstruction}

IMPORTANT: Use web search to get current information for:
- Today's date and time
- Real-time stock prices and market data
- Recent Federal Reserve announcements, policy moves, and commentary
- Prevailing market sentiment indicators and recent market events
- Current economic indicators

Focus ONLY on finance and investment-related topics.${conversationContext}`
        
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
    let systemPrompt = `${FINANCE_SYSTEM_PROMPT}\n\nNote: Web search is currently unavailable. I'll provide analysis based on my training data. For real-time information, please check current sources.`

    if (requestTickers.length > 0) {
      systemPrompt += `\n\nPrimary tickers to reference in your follow-up question: ${requestTickers.map(t => `$${t}`).join(', ')}.`
    }

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
