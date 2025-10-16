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
Example: Would you like me to compare $SFDC with $MSFT next?`

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
  const parsed = parseFloat(cleaned)
  if (!Number.isFinite(parsed)) {
    return raw.endsWith('x') ? raw : `${raw}x`
  }
  const rounded = Math.round(parsed * 10) / 10
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
Return ONLY raw JSON matching the specified schema—no markdown, no surrounding text.

Requirements:
- context_summary: Two sentences describing the shared AI/power-demand tailwinds and major risks. Do NOT reference specific media outlets, banks, or publishers by name.
- For each requested ticker, include the official company name and an experts array containing exactly these experts: ${expertList}. Provide them all.
- For every expert, supply numerical MOIC values as decimals (no trailing "x"), an integer durability score 1-10, and a one-to-two sentence rationale focused on metrics or catalysts WITHOUT naming specific news outlets or banks.
- quick_take: Exactly three entries highlighting (1) highest durability, (2) balanced but cyclical profile, (3) highest upside/highest beta. Encourage the reader to compare or size positions across the tickers in at least one entry, while avoiding explicit outlet or bank names.
- Encourage peers comparison implicitly to nudge the user toward comparing positions.
- Do NOT include follow-up questions, markdown, or additional commentary.`

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

export async function POST(request: NextRequest) {
  try {
    // Check authentication and user permissions
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'kyle@zaigo.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, files } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // Check if the user is asking to update the system prompt
    const lastMessage = messages[messages.length - 1]
    const requestTickers = extractTickers(lastMessage?.content ?? '')
    const threeYearModeRequested = isThreeYearModeRequest(lastMessage?.content ?? '')
    let expertNames: string[] = []

    if (threeYearModeRequested) {
      const roster = await getUserExpertRoster(supabase, user?.id)
      expertNames = roster.map((expert) => expert.name)
      if (!expertNames.length) {
        expertNames = [...DEFAULT_EXPERT_NAMES]
      }
    }
    const isSystemPromptUpdate = lastMessage?.content && (
      lastMessage.content.toLowerCase().includes('update system prompt') ||
      lastMessage.content.toLowerCase().includes('change system prompt') ||
      lastMessage.content.toLowerCase().includes('new system prompt') ||
      lastMessage.content.toLowerCase().includes('update the prompt') ||
      lastMessage.content.toLowerCase().includes('change the prompt') ||
      lastMessage.content.toLowerCase().includes('update config')
    )

    if (isSystemPromptUpdate) {
      // Get the current system prompt first
      const { data: existingConfig } = await supabase
        .from('configurations')
        .select('*')
        .single()
      
      const currentPrompt = existingConfig?.system_prompt || 'You are an AI assistant that helps create engaging weekly digest content.'
      const configId = existingConfig?.id || 'ac8bb385-2456-4efe-9c51-599222760dbf'
      
      // Use AI to intelligently refine the system prompt based on user's request
      try {
        const refinementMessages = [
          {
            role: 'system' as const,
            content: `You are an expert at refining and improving system prompts. Your task is to take an existing system prompt and modify it based on the user's request. 
            
            Guidelines:
            - Preserve the core functionality and structure of the original prompt
            - Integrate the user's requested changes intelligently
            - Maintain any important context, formatting, or special instructions
            - If the user asks for a complete replacement (e.g., "completely new prompt"), then replace it entirely
            - If the user asks for additions or modifications, merge them thoughtfully
            - Keep the refined prompt clear, concise, and effective
            
            Return ONLY the refined system prompt without any explanation or metadata.`
          },
          {
            role: 'user' as const,
            content: `Current system prompt:
${currentPrompt}

User's request: ${lastMessage.content}

Please refine the system prompt based on this request.`
          }
        ]
        
        const refinementResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: refinementMessages,
          temperature: 0.45,
          max_tokens: 8000,
        })
        
        const refinedPrompt = refinementResponse.choices[0].message.content?.trim()
        
        if (refinedPrompt) {
          // Update the system prompt in the database
          const { error } = await supabase
            .from('configurations')
            .upsert({
              id: configId,
              system_prompt: refinedPrompt,
              updated_at: new Date().toISOString()
            })

          if (!error) {
            // Create a summary of the changes
            const summaryMessages = [
              {
                role: 'system' as const,
                content: 'Summarize the key changes made to the system prompt in 2-3 bullet points. Be specific about what was added, modified, or emphasized.'
              },
              {
                role: 'user' as const,
                content: `Original prompt: ${currentPrompt}\n\nUpdated prompt: ${refinedPrompt}\n\nUser request: ${lastMessage.content}`
              }
            ]
            
            const summaryResponse = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: summaryMessages,
              temperature: 0.45,
              max_tokens: 8000,
            })
            
            const changeSummary = summaryResponse.choices[0].message.content || 'System prompt has been updated based on your request.'
            
            return NextResponse.json({
              message: {
                id: Date.now().toString(),
                content: appendDefaultFollowUp(
                  `System prompt has been successfully refined! Here's what changed:\n\n${changeSummary}\n\nI will now use this updated prompt for all future conversations.`,
                  'Do you want me to draft a sample reply with this prompt?',
                  requestTickers
                ),
                sender: 'assistant',
                timestamp: new Date(),
              }
            })
          } else {
            console.error('Error updating system prompt:', error)
            return NextResponse.json({
              message: {
                id: Date.now().toString(),
                content: appendDefaultFollowUp(
                  'Sorry, I encountered an error updating the system prompt. Please try again or contact support.',
                  'Would you like me to attempt the prompt update again for you?',
                  requestTickers
                ),
                sender: 'assistant',
                timestamp: new Date(),
              }
            })
          }
        } else {
          return NextResponse.json({
            message: {
              id: Date.now().toString(),
              content: appendDefaultFollowUp(
                "I couldn't generate a refined prompt. Please try rephrasing your request.",
                'Would you like me to try refining it with different wording?',
                requestTickers
              ),
              sender: 'assistant',
              timestamp: new Date(),
            }
          })
        }
      } catch (refinementError) {
        console.error('Error refining system prompt:', refinementError)
        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            content: appendDefaultFollowUp(
              'Sorry, I encountered an error while refining the system prompt. Please try again.',
              'Would you like me to attempt that refinement once more for you?',
              requestTickers
            ),
            sender: 'assistant',
            timestamp: new Date(),
          }
        })
      }
    }

    // Get system prompt from configurations table
    const { data: config } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()

    const systemPrompt = config?.system_prompt || 'You are an AI assistant that helps create engaging weekly digest content.'

    // Parse input modes and content
    const parseInputMode = (content: string) => {
      if (content.startsWith('[Think: ') && content.endsWith(']')) {
        return { mode: 'think', content: content.slice(8, -1) }
      }
      return { mode: 'normal', content }
    }

    const { mode, content } = parseInputMode(lastMessage?.content || '')
    const tickers = extractTickers(content)
    
    // Check if the message requires real-time data or web search
    const needsWebSearch = (content && (
      content.toLowerCase().includes('latest') ||
      content.toLowerCase().includes('news') ||
      content.toLowerCase().includes('current') ||
      content.toLowerCase().includes('today') ||
      content.toLowerCase().includes('stock price') ||
      content.toLowerCase().includes('market') ||
      content.toLowerCase().includes('earnings') ||
      content.toLowerCase().includes('recent')
    ))

    // Generate response using Chat Completions
    // Note: Real-time web search is currently unavailable
    let enhancedSystemPrompt = `${systemPrompt}

${FOLLOW_UP_DIRECTIVE}

Additionally, you can help the user update your system prompt. If they ask to update, change, or modify the system prompt, acknowledge their request and explain that they need to provide the new prompt in quotes or after a colon.`
    
    if (needsWebSearch) {
      enhancedSystemPrompt += `\n\nNote: Real-time web search is currently unavailable. I'll provide the best information based on my training data.`
    }

    if (tickers.length > 0) {
      const formattedTickers = tickers.map(t => `$${t}`).join(', ')
      enhancedSystemPrompt += `\n\nPrimary tickers to reference in your follow-up question: ${formattedTickers}.`
    }

    const effectiveExpertNames = expertNames.length ? expertNames : [...DEFAULT_EXPERT_NAMES]

    if (threeYearModeRequested && tickers.length > 0) {
      const guidance = buildThreeYearModeGuidance(tickers, effectiveExpertNames)
      enhancedSystemPrompt += guidance
    }
    
    if (mode === 'think') {
      enhancedSystemPrompt += `\n\nIMPORTANT: The user has activated "Think" mode. This requires deep, analytical thinking with enhanced processing time and thoroughness. Please:

1. **Deep Analysis**: Provide comprehensive, step-by-step reasoning with detailed explanations
2. **Multiple Perspectives**: Consider various angles, potential alternatives, and edge cases
3. **Structured Thinking**: Break down complex problems into logical components
4. **Evidence-Based**: Support conclusions with reasoning and examples where applicable
5. **Comprehensive Coverage**: Be thorough and exhaustive in your analysis
6. **Show Your Work**: Explain your thought process, assumptions, and decision-making steps
7. **Consider Implications**: Think about consequences, trade-offs, and broader impacts

Take your time to think deeply about this request and provide a thoughtful, well-reasoned response that demonstrates enhanced analytical processing.`
    }
    
    // Handle files if present
    if (files && files.length > 0) {
      enhancedSystemPrompt += `\n\nNote: The user has uploaded ${files.length} file(s). Currently, file analysis is not fully implemented, but acknowledge the files and provide relevant assistance based on the text content.`
    }

    // Update the last message to use cleaned content
    const processedMessages = messages.map((msg, index) => {
      if (index === messages.length - 1) {
        return { ...msg, content }
      }
      return msg
    })

    if (threeYearModeRequested && tickers.length > 0) {
      try {
        const structuredMessages = processedMessages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))

        const structuredPayload = await generateThreeYearModePayload(structuredMessages, tickers, effectiveExpertNames)
        const formatted = formatThreeYearModeResponse(structuredPayload, tickers, effectiveExpertNames)

        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            content: appendDefaultFollowUp(formatted, undefined, tickers),
            sender: 'assistant',
            timestamp: new Date(),
          }
        })
      } catch (structuredError) {
        console.error('Structured 3Y Mode generation failed, falling back to standard completion:', structuredError)
      }
    }

    const messagesWithSystem = [
      { role: 'system' as const, content: enhancedSystemPrompt },
      ...processedMessages
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
        sender: 'assistant',
        timestamp: new Date(),
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
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
