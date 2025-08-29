import { NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'
import { handleApiError, ApiError, createSuccessResponse, checkRateLimit } from '@/utils/api-errors'
import { NewsletterService } from '@/services/newsletter.service'
import { ContentGenerationService } from '@/services/content-generation.service'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    checkRateLimit(`expert-analysis-${ip}`, 10, 60000)

    const supabase = await createClient()

    // Parse request body
    const body = await request.json()
    const { expert_id, expert_ids, stock_ticker } = body as {
      expert_id?: string
      expert_ids?: string[]
      stock_ticker?: string
    }

    if (!stock_ticker) throw new ApiError(400, 'Stock or ETF ticker is required')

    // Validate stock ticker format
    const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/
    if (!tickerRegex.test(stock_ticker)) throw new ApiError(400, 'Invalid stock ticker format')

    // Determine selected experts (support single or multiple)
    const selectedExpertIds: string[] = Array.isArray(expert_ids) && expert_ids.length > 0
      ? expert_ids
      : (expert_id ? [expert_id] : [])
    if (selectedExpertIds.length === 0) throw new ApiError(400, 'At least one expert must be selected')

    // Fetch experts
    const { data: experts, error: expertsError } = await supabase
      .from('experts')
      .select('*')
      .in('id', selectedExpertIds)
    if (expertsError || !experts || experts.length === 0) throw new ApiError(404, 'Selected experts not found or inactive')

    // Generate analysis
    const analysis = await generateExpertAnalysis(experts, stock_ticker)

    // Prepare response
    const result = {
      id: crypto.randomUUID(),
      stock_ticker,
      company_name: analysis.company_name,
      expert_name: experts.map(e => e.name).join(', '),
      expert_id: selectedExpertIds.length === 1 ? selectedExpertIds[0] : 'multiple',
      analysis: analysis.content,
      timestamp: new Date().toISOString(),
      current_price: analysis.current_price,
      market_cap: analysis.market_cap,
      pe_ratio: analysis.pe_ratio,
    }

    // Optionally store in database for logged-in users
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_analyses').insert({
        user_id: user.id,
        expert_id: selectedExpertIds.length === 1 ? selectedExpertIds[0] : null,
        stock_ticker,
        analysis: analysis.content,
        metadata: {
          company_name: analysis.company_name,
          current_price: analysis.current_price,
          market_cap: analysis.market_cap,
          pe_ratio: analysis.pe_ratio,
          experts: experts.map(e => ({ id: e.id, name: e.name })),
        },
      })
    }

    const response = createSuccessResponse({ data: result }, 200)
    // Add cache headers for analysis results
    response.headers.set(
      'Cache-Control',
      'private, s-maxage=1800, stale-while-revalidate=3600'
    )
    return response
  } catch (error) {
    return handleApiError(error)
  }
}

interface ExpertRecord {
  id: string
  name: string
  title?: string
  investing_law?: string
  framework_description?: string
}

async function generateExpertAnalysis(experts: ExpertRecord[], ticker: string) {
  try {
    // Pull system prompt using service role (bypass RLS)
    const serviceSupabase = createServiceClient()
    const config = await NewsletterService.getConfiguration(serviceSupabase)

    // Compose prompt and request a meta JSON block (price only)
    const composedPrompt = adaptSystemPrompt(config.system_prompt, experts, ticker)
    const metaInstruction = `\n\nAt the very end of your response, add a single fenced code block with json containing exactly this object and nothing else:\n{\n  \"meta\": {\n    \"ticker\": \"${ticker.toUpperCase()}\",\n    \"price\": <number>\n  }\n}\n`

    let content = await ContentGenerationService.generateContent(composedPrompt + metaInstruction)

    // Extract meta
    const metaMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    let meta: { meta?: { ticker?: string; price?: number } } | null = null
    if (metaMatch) {
      try { meta = JSON.parse(metaMatch[1]) } catch { meta = null }
      content = content.replace(metaMatch[0], '').trim()
    }

    // Clean trailing unwanted sections
    content = trimContentAfterUnwantedHeadings(content)

    // Fallback parsing for price if meta missing
    const priceMatch = content.match(/\b(?:current\s+price|stock\s+price)\s*[:=-]?\s*\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i)?.[1]

    return {
      content,
      company_name: ticker,
      current_price: meta?.meta?.price ?? (priceMatch ? Number(priceMatch.replace(/,/g, '')) : null),
      market_cap: null,
      pe_ratio: null,
    }
  } catch (error) {
    throw new ApiError(500, 'Failed to generate expert analysis', error)
  }
}

function adaptSystemPrompt(systemPrompt: string, experts: ExpertRecord[], ticker: string): string {
  let prompt = systemPrompt

  // Replace target company/ticker in the task line
  prompt = prompt.replace(
    /## YOUR TASK:[^\n]*/,
    `## YOUR TASK: For ${ticker.toUpperCase()} (the company) and provide a complete investment analysis using the framework below. Use web search to get current market data.`
  )

  // Replace company in "What X Does" heading
  prompt = prompt.replace(
    /## What [^\n]+ Does \(in Layman's Terms\)/,
    `## What ${ticker.toUpperCase()} Does (in Layman's Terms)`
  )

  // Expert Opinions: ticker-specific, metric-backed one-liners
  const opinionHeader = /## Expert Opinions[\s\S]*?(?=\n##\s)/
  if (opinionHeader.test(prompt)) {
    const t = ticker.toUpperCase()
    const mk = (name: string, text: string) => `**${name}**: [${text}]`
    const expertLines = experts.map(e => {
      const key = e.name.toLowerCase()
      if (key === 'bill gurley') return mk(e.name, `For ${t}, give a decisive valuation view (cheap/fair/expensive); include one concrete metric (P/E vs 5y avg, gross margin %, unit economics) and pricing power evidence.`)
      if (key === 'brad gerstner') return mk(e.name, `For ${t}, write a narrative+math thesis; cite a growth/AI metric (revenue growth %, AI revenue share) and why adoption is durable.`)
      if (key === 'stan druckenmiller' || key === 'stanley druckenmiller') return mk(e.name, `For ${t}, give a macro-timing call with explicit risk/reward; mention a catalyst or cycle metric and whether asymmetry is attractive.`)
      if (key === 'mary meeker') return mk(e.name, `For ${t}, provide an AI infra/adoption take; include a concrete adoption/usage/cost metric and enterprise implication.`)
      if (key === 'brian birtwistle') return mk(e.name, `For ${t}, assess GTM/pricing/brand power; reference signal velocity or pricing power evidence and the likely category outcome.`)
      return mk(e.name, `For ${t}, deliver a one-sentence opinion using ${e.name}'s lens; include one concrete metric and a clear stance (bullish/neutral/cautious).`)
    }).join('\n\n')
    const replacement = `## Expert Opinions\n\n${expertLines}\n\n`
    prompt = prompt.replace(opinionHeader, replacement)
  }

  // Summary Table: only selected experts
  const tableHeader = /## Expert Analysis Summary Table[\s\S]*?(?=\n##\s)/
  if (tableHeader.test(prompt)) {
    const rows = experts.map(e => `| ${e.name} | [Brief analysis] | [Key focus] | [X.X]x | [X.X]x | [X.X]x |`).join('\n')
    const table = `## Expert Analysis Summary Table\n\nCreate a table with actual analysis and MOIC projections for your chosen company:\n\n| Expert | Analysis | Focus | Bear MOIC | Base MOIC | Bull MOIC |\n|--------|----------|-------|-----------|-----------|-----------|\n${rows}\n\n`
    prompt = prompt.replace(tableHeader, table)
  }

  // Adjust summary judgment count
  prompt = prompt.replace(/5 expert views/g, `${experts.length} expert views`)

  // Remove personas/requirements/quality/red flags sections
  const removeBlocks: RegExp[] = [
    /###\s*Expert Personas for Reference[\s\S]*?(?=\n###\s|\n##\s|$)/,
    /###\s*Selected Expert Personas[\s\S]*?(?=\n###\s|\n##\s|$)/,
    /###\s*Analysis Requirements[\s\S]*?(?=\n###\s|\n##\s|$)/,
    /###\s*Quality Standards[\s\S]*?(?=\n###\s|\n##\s|$)/,
    /###\s*Red Flags \(Automatic Avoid\)[\s\S]*?(?=\n###\s|\n##\s|$)/,
  ]
  for (const rx of removeBlocks) { prompt = prompt.replace(rx, '') }

  return prompt.trim()
}

function trimContentAfterUnwantedHeadings(content: string): string {
  const patterns = [
    /###\s*Selected Expert Personas/i,
    /###\s*Expert Personas for Reference/i,
    /###\s*Analysis Requirements/i,
    /###\s*Quality Standards/i,
    /###\s*Red Flags\s*\(Automatic Avoid\)/i,
  ]
  let cutIndex: number | null = null
  for (const rx of patterns) {
    const m = rx.exec(content)
    if (m && (cutIndex === null || m.index < cutIndex)) cutIndex = m.index
  }
  if (cutIndex !== null) return content.slice(0, cutIndex).trim()
  return content
}

