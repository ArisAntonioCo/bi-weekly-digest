import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'
import { getUserExpertRoster, DEFAULT_EXPERT_NAMES } from '@/lib/expert-roster'

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
    return `Would you like me to compare the 3-year MOIC of $${unique[0]} to $${unique[1]} next?`
  }

  const rest = unique.slice(1)
  const formattedRest = rest.length === 1
    ? `$${rest[0]}`
    : `${rest.slice(0, -1).map(t => `$${t}`).join(', ')} or $${rest[rest.length - 1]}`
  return `Would you like me to compare the 3-year MOIC of $${unique[0]} to ${formattedRest} next?`
}

const appendDefaultFollowUp = (text: string, suggestion?: string, tickers: string[] = []) => {
  const followUp = suggestion ?? buildDefaultTickerFollowUp(tickers)
  return `${text}\n\n${followUp}`
}

const isThreeYearModeRequest = (content: string): boolean => {
  if (!content) return false
  const normalized = content.toLowerCase()
  const mentionsThreeYearMode = normalized.includes('3y mode') || normalized.includes('3-year mode') || normalized.includes('3 year mode')
  const mentionsExperts =
    normalized.includes('my 5 experts') ||
    normalized.includes('my five experts') ||
    normalized.includes('your 5 experts') ||
    normalized.includes('your five experts') ||
    normalized.includes('5 experts') ||
    normalized.includes('my expert') ||
    normalized.includes('my experts') ||
    normalized.includes('your expert') ||
    normalized.includes('your experts') ||
    normalized.includes('expert framework')
  const mentionsMoic = normalized.includes('moic')
  const mentionsDurability = normalized.includes('durability') || normalized.includes('pullback') || normalized.includes('correction') || normalized.includes('crash')
  return mentionsThreeYearMode && (mentionsExperts || mentionsMoic || mentionsDurability)
}

const buildThreeYearModeGuidance = (tickers: string[], expertNames: string[]): string => {
  if (!tickers.length || !expertNames.length) {
    return ''
  }

  const formattedTickers = tickers.map(t => `$${t}`).join(', ')
  const expertList = (expertNames.length ? expertNames : DEFAULT_EXPERT_NAMES).join(', ')
  const expertCountLabel = expertNames.length === 1
    ? 'expert framework'
    : `${expertNames.length} expert frameworks`

  return `\n\nWhen the request matches 3Y Mode, respond using this exact structure:\n1. Opening line: "Got it—activating 3Y Mode (your ${expertCountLabel}) for ${formattedTickers}. Each expert lists Base/Bull/Bear 3-year MOIC plus a durability score (1–10) for a correction/crash. Brief rationale included. (Context: <two short sentences summarizing the shared macro/theme drivers with one or two cited sources)."\n2. For each ticker, add a heading line: "$TICKER — <Company Name>".\n3. For every expert (${expertList}) provide a single line with "Expert Name — MOIC: Base <value>x / Bull <value>x / Bear <value>x · Durability <score>/10" followed by a new line starting with " Rationale:" and a concise justification. Each rationale must reference a credible source (e.g., Reuters, Goldman Sachs) using inline citations at the end.\n4. Preserve the expert order exactly as provided above for every ticker.\n5. After processing all tickers, add a "Quick take (relative)" section containing three succinct comparisons aligned with durability, balance/cyclicality, and upside/beta. Include citations where relevant and encourage comparing positions.\n6. Avoid additional commentary, tables, or markdown beyond what is specified. Maintain blank lines between sections exactly as in the reference format.`
}

interface ThreeYearModeExpert {
  name: string
  base_moic: number | string
  bull_moic: number | string
  bear_moic: number | string
  durability: number | string
  rationale: string
  source?: string
}

interface ThreeYearModeTicker {
  ticker: string
  company_name: string
  experts: ThreeYearModeExpert[]
}

interface ThreeYearModePayload {
  context_summary: string
  tickers: ThreeYearModeTicker[]
  quick_take: string[]
}

const createThreeYearModeSchema = (expertNames: string[]) => {
  const roster = expertNames.length ? expertNames : [...DEFAULT_EXPERT_NAMES]
  const expertCount = roster.length || 1

  return {
  type: 'object',
  additionalProperties: false,
  required: ['context_summary', 'tickers', 'quick_take'],
  properties: {
    context_summary: { type: 'string' },
    tickers: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['ticker', 'company_name', 'experts'],
        additionalProperties: false,
        properties: {
          ticker: { type: 'string' },
          company_name: { type: 'string' },
          experts: {
            type: 'array',
            minItems: expertCount,
            maxItems: expertCount,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'base_moic', 'bull_moic', 'bear_moic', 'durability', 'rationale', 'source'],
              properties: {
                name: {
                  type: 'string',
                  enum: roster
                },
                base_moic: { type: ['number', 'string'] },
                bull_moic: { type: ['number', 'string'] },
                bear_moic: { type: ['number', 'string'] },
                durability: { type: ['number', 'integer', 'string'] },
                rationale: { type: 'string' },
                source: { type: 'string' }
              }
            }
          }
        }
      }
    },
    quick_take: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: { type: 'string' }
    }
  }
} as const
}

const normalizeMoic = (value: number | string): string => {
  const raw = typeof value === 'number' ? value.toString() : value
  const cleaned = raw.replace(/[^\d.\-]/g, '')
  const numeric = parseFloat(cleaned)
  if (!Number.isFinite(numeric)) {
    return raw.trim().endsWith('x') ? raw.trim() : `${raw.trim()}x`
  }
  const rounded = Math.round(numeric * 10) / 10
  const formatted = rounded.toFixed(1).replace(/\.0$/, '')
  return `${formatted}x`
}

const normalizeDurability = (value: number | string): string => {
  const numeric = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.]/g, ''))
  const safeNumber = Number.isFinite(numeric) ? numeric : 5
  const clamped = Math.max(1, Math.min(10, Math.round(safeNumber)))
  return `${clamped}/10`
}

const STRIP_BRANDS_REGEX = /\b(Reuters|Bloomberg|CNBC|TechCrunch|Forbes|Goldman Sachs|CNN|WSJ|Wall Street Journal)\b/gi

const stripTrailingCitations = (text: string): string => {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/(?:Source:)?\s*\(?\s*(Reuters|Bloomberg|CNBC|TechCrunch|Forbes|Goldman Sachs|CNN|WSJ|Wall Street Journal)\s*\)?\.?$/i, '').trim()
  cleaned = cleaned.replace(/(?:Source:)\s*$/i, '').trim()
  cleaned = cleaned.replace(/\b(as reported by|according to)\b\s*/gi, '')
  cleaned = cleaned.replace(STRIP_BRANDS_REGEX, '').trim()
  cleaned = cleaned.replace(/\(\s*\)/g, '').trim()
  cleaned = cleaned.replace(/\s{2,}/g, ' ')
  return cleaned
}

const formatRationale = (rationale: string): string => stripTrailingCitations(rationale.replace(/\s+/g, ' '))
const scrubSyntheticSource = (source?: string): string => {
  if (!source) return ''
  const trimmed = source.trim()
  if (!trimmed) return ''
  const lower = trimmed.toLowerCase()
  if (lower.includes('goldman sachs') || lower.includes('forbes') || lower.includes('cnn')) {
    return ''
  }
  return trimmed
}

const formatThreeYearModeResponse = (payload: ThreeYearModePayload, tickers: string[], expertNames: string[]): string => {
  const uniqueTickers = Array.from(new Set(tickers.map(t => t.toUpperCase())))
  const tickerMap = new Map(payload.tickers.map(t => [t.ticker.toUpperCase(), t]))
  const introTickers = uniqueTickers.filter(t => tickerMap.has(t))
  const introList = introTickers.map(t => `$${t}`).join(', ')
  const expertLabel = expertNames.length === 1
    ? 'your expert framework'
    : `your ${expertNames.length} expert frameworks`

  const lines: string[] = []
  lines.push(`Got it—activating 3Y Mode (${expertLabel}) for ${introList}. Each expert lists Base/Bull/Bear 3-year MOIC plus a durability score (1–10) for a correction/crash. Brief rationale included.`)
  lines.push('')

  introTickers.forEach(symbol => {
    const tickerData = tickerMap.get(symbol)
    if (!tickerData) return
    lines.push(`**${symbol} — ${tickerData.company_name}**`)
    lines.push('')

    expertNames.forEach(name => {
      const expert = tickerData.experts.find(e => e.name === name)
      if (!expert) return
      const base = normalizeMoic(expert.base_moic)
      const bull = normalizeMoic(expert.bull_moic)
      const bear = normalizeMoic(expert.bear_moic)
      const durability = normalizeDurability(expert.durability)
      const rationale = formatRationale(expert.rationale)
      const cleanedSource = scrubSyntheticSource(expert.source)
      const source = cleanedSource ? ` ${cleanedSource}` : ''

      lines.push(`**${name}** — MOIC: Base ${base} / Bull ${bull} / Bear ${bear}<br>Durability ${durability}<br>Rationale: ${rationale}${source}`)
      lines.push('')
    })

    if (lines[lines.length - 1] === '') {
      lines.pop()
    }

    lines.push('')
  })

  lines.push('Quick take (relative)')
  payload.quick_take.forEach(entry => {
    const cleaned = stripTrailingCitations(entry)
    if (!cleaned.trim()) return
    lines.push(`- ${cleaned.trim()}`)
  })

  return lines.join('\n')
}

const generateThreeYearModePayload = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  tickers: string[],
  expertNames: string[]
): Promise<ThreeYearModePayload> => {
  const uniqueTickers = Array.from(new Set(tickers.map(t => t.toUpperCase())))
  const expertList = (expertNames.length ? expertNames : [...DEFAULT_EXPERT_NAMES]).join(', ')

  const structuredSystemPrompt = `You are preparing a structured 3Y Mode investment analysis for tickers: ${uniqueTickers.map(t => `$${t}`).join(', ')}.
Return ONLY raw JSON matching the specified schema—no markdown or surrounding commentary.

Requirements:
- context_summary: Two sentences on shared AI/power-demand tailwinds and key risks. Do NOT reference specific media outlets, banks, or publishers by name.
- For each requested ticker, include the official company name and exactly these experts: ${expertList}.
- For every expert, supply decimal MOIC values (no trailing "x"), an integer durability score 1-10, and a one-to-two sentence rationale focused on metrics or catalysts WITHOUT naming specific news outlets or banks.
- quick_take: Exactly three entries highlighting (1) highest durability, (2) balanced-but-cyclical profile, (3) highest upside/highest beta. At least one entry should encourage comparing or sizing positions across tickers, while avoiding explicit outlet or bank names.
- Do NOT include follow-up questions or extra commentary outside the JSON.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.35,
    max_tokens: 4000,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'three_year_mode_analysis',
        schema: createThreeYearModeSchema(expertNames)
      }
    },
    messages: [
      { role: 'system', content: structuredSystemPrompt },
      ...messages
    ]
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No structured content returned from OpenAI')
  }

  try {
    return JSON.parse(content) as ThreeYearModePayload
  } catch (error) {
    throw new Error(`Failed to parse structured 3Y Mode payload: ${(error as Error).message}`)
  }
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
    const threeYearModeRequested = isThreeYearModeRequest(lastMessage?.content ?? '')
    let expertNames: string[] = []

    if (threeYearModeRequested) {
      const roster = await getUserExpertRoster(supabase, user.id)
      expertNames = roster.map(expert => expert.name)
      if (!expertNames.length) {
        expertNames = [...DEFAULT_EXPERT_NAMES]
      }
    }
    
    const effectiveExpertNames = expertNames.length ? expertNames : [...DEFAULT_EXPERT_NAMES]

    if (threeYearModeRequested && requestTickers.length > 0) {
      try {
        const structuredMessages = messages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))

        const payload = await generateThreeYearModePayload(structuredMessages, requestTickers, effectiveExpertNames)
        const formatted = formatThreeYearModeResponse(payload, requestTickers, effectiveExpertNames)

        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            content: appendDefaultFollowUp(formatted, undefined, requestTickers),
            role: 'assistant',
            timestamp: new Date(),
          }
        })
      } catch (structuredError) {
        console.error('Structured 3Y Mode generation failed in finance chat, falling back:', structuredError)
      }
    }

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
        const threeYearGuidance = threeYearModeRequested && requestTickers.length > 0
          ? buildThreeYearModeGuidance(requestTickers, effectiveExpertNames)
          : ''
        const instructions = `${FINANCE_SYSTEM_PROMPT}${tickerInstruction}${threeYearGuidance}

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

    if (threeYearModeRequested && requestTickers.length > 0) {
      systemPrompt += buildThreeYearModeGuidance(requestTickers, effectiveExpertNames)
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
