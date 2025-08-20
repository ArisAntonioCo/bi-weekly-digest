import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { openai } from '@/lib/openai'
import { handleApiError, ApiError, createSuccessResponse, checkRateLimit } from '@/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    checkRateLimit(`expert-analysis-${ip}`, 10, 60000) // 10 requests per minute
    
    const supabase = await createClient()
    
    // Parse request body
    const body = await request.json()
    const { expert_id, stock_ticker } = body
    
    if (!expert_id || !stock_ticker) {
      throw new ApiError(400, 'Expert ID and stock ticker are required')
    }
    
    // Validate stock ticker format
    const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/
    if (!tickerRegex.test(stock_ticker)) {
      throw new ApiError(400, 'Invalid stock ticker format')
    }
    
    // Fetch expert data
    const { data: expert, error: expertError } = await supabase
      .from('experts')
      .select('*')
      .eq('id', expert_id)
      .eq('is_active', true)
      .single()
    
    if (expertError || !expert) {
      throw new ApiError(404, 'Expert not found or inactive')
    }
    
    // Generate analysis using expert framework
    const analysis = await generateExpertAnalysis(expert, stock_ticker)
    
    // Prepare response
    const result = {
      id: crypto.randomUUID(),
      stock_ticker,
      company_name: analysis.company_name,
      expert_name: expert.name,
      expert_id: expert.id,
      analysis: analysis.content,
      timestamp: new Date().toISOString(),
      current_price: analysis.current_price,
      market_cap: analysis.market_cap,
      pe_ratio: analysis.pe_ratio
    }
    
    // Optionally store in database for logged-in users
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('user_analyses')
        .insert({
          user_id: user.id,
          expert_id: expert.id,
          stock_ticker,
          analysis: analysis.content,
          metadata: {
            company_name: analysis.company_name,
            current_price: analysis.current_price,
            market_cap: analysis.market_cap,
            pe_ratio: analysis.pe_ratio
          }
        })
    }
    
    return createSuccessResponse(result, 200)
  } catch (error) {
    return handleApiError(error)
  }
}

async function generateExpertAnalysis(expert: any, ticker: string) {
  const { logger } = await import('@/lib/logger')
  
  // Build expert-specific prompt
  const expertPrompt = `
You are analyzing ${ticker} through the investment framework of ${expert.name}${expert.title ? ` (${expert.title})` : ''}.

EXPERT'S INVESTING LAW:
"${expert.investing_law}"

${expert.focus_areas ? `FOCUS AREAS: ${expert.focus_areas}` : ''}

${expert.framework_description ? `FRAMEWORK: ${expert.framework_description}` : ''}

Provide a comprehensive analysis of ${ticker} specifically through this expert's lens. Include:

1. **Executive Summary**: How this expert would view this stock (2-3 sentences)

2. **Investment Thesis**: Apply the expert's investing law to evaluate this company
   - Key strengths aligned with the expert's framework
   - Potential concerns from the expert's perspective

3. **Valuation Assessment**: Using the expert's valuation approach
   - Is it trading at an attractive level according to this framework?
   - Key metrics this expert would focus on

4. **Risk Analysis**: What risks would this expert be most concerned about?
   - Company-specific risks
   - Market/sector risks
   - Framework-specific concerns

5. **3-Year Outlook**: Projection based on this expert's typical time horizon
   - Expected MOIC (Multiple on Invested Capital)
   - Key catalysts and milestones
   - Probability of success

6. **Action Recommendation**: What would this expert advise?
   - Buy/Hold/Wait/Avoid
   - Position sizing suggestion
   - Entry/exit strategy

Format the response in clear sections with markdown formatting. Be specific and quantitative where possible.
Focus on actionable insights that reflect this particular expert's investment philosophy.
`

  try {
    // Try to get real-time data with web search
    try {
      logger.debug(`Attempting expert analysis with web search for ${ticker}`)
      const response = await openai.responses.create({
        model: 'gpt-4o',
        instructions: expertPrompt + `\n\nIMPORTANT: Use web search to get current stock price, market cap, PE ratio, and recent news for ${ticker}.`,
        input: `Analyze ${ticker} stock with current market data. Include the current stock price, market cap, and PE ratio in your response.`,
        tools: [{ type: 'web_search_preview' }],
      })
      
      logger.info('Expert analysis with web search succeeded')
      
      // Parse response to extract metrics (this is simplified, you might want more robust parsing)
      const content = response.output_text || ''
      const priceMatch = content.match(/\$(\d+\.?\d*)/)?.[1]
      const marketCapMatch = content.match(/market cap[:\s]+\$?([\d.]+[BMT])/i)?.[1]
      
      return {
        content,
        company_name: ticker, // You could enhance this with actual company name lookup
        current_price: priceMatch ? parseFloat(priceMatch) : null,
        market_cap: marketCapMatch || null,
        pe_ratio: null // Could parse this from response
      }
    } catch (responsesError) {
      logger.warn('Responses API failed, falling back to Chat Completions', {
        error: responsesError instanceof Error ? responsesError.message : 'Unknown error'
      })
      
      // Fallback to regular chat completions
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.45,
        messages: [
          { 
            role: 'system', 
            content: expertPrompt 
          },
          {
            role: 'user',
            content: `Analyze ${ticker} stock based on available market data. Provide a comprehensive analysis following the framework outlined.`
          }
        ],
        max_tokens: 3000,
      })
      
      return {
        content: completion.choices[0].message.content || 'Analysis unavailable',
        company_name: ticker,
        current_price: null,
        market_cap: null,
        pe_ratio: null
      }
    }
  } catch (error) {
    throw new ApiError(500, 'Failed to generate expert analysis', error)
  }
}