import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'
import { Paginated } from '@/types/pagination'
import { Blog } from '@/types/blog'
import { handleApiError, ApiError, createSuccessResponse, checkRateLimit } from '@/utils/api-errors'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    // Basic rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    checkRateLimit(`blogs-get-${ip}`, 30, 60000) // 30 requests per minute
    
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    // Get pagination parameters with validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const sort = searchParams.get('sort') || 'latest' // 'latest' or 'oldest'
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    
    // Validate sort parameter
    if (!['latest', 'oldest'].includes(sort)) {
      throw new ApiError(400, 'Invalid sort parameter', { valid: ['latest', 'oldest'] })
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit
    
    // Get system prompt from configurations table
    const { data: config, error: configError } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()
    
    if (configError) {
      throw new ApiError(500, 'Failed to fetch configuration')
    }

    // Remove only the CONTENT RESTRICTION POLICY section if it exists
    let systemPrompt = config?.system_prompt || ''
    if (systemPrompt.includes('CONTENT RESTRICTION POLICY:')) {
      const parts = systemPrompt.split('Core Analytical Framework:')
      if (parts.length > 1) {
        systemPrompt = 'Core Analytical Framework:' + parts[1]
      }
    }

    // Get a brief summary of the system prompt for the header
    const systemPromptSummary = await getSystemPromptSummary(systemPrompt)

    // Build query with filters
    let query = supabase.from('blogs').select('*', { count: 'exact', head: true })
    
    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }
    
    // Add type filter if provided
    if (type !== 'all') {
      switch (type) {
        case 'moic':
          query = query.or('content.ilike.%moic%,content.ilike.%multiple on invested capital%')
          break
        case 'risk':
          query = query.or('content.ilike.%bear case%,content.ilike.%risk%')
          break
        case 'insight':
          // Default - will match entries that don't specifically match MOIC or Risk
          query = query.not('content', 'ilike', '%moic%')
                      .not('content', 'ilike', '%bear case%')
                      .not('content', 'ilike', '%risk%')
          break
      }
    }

    // Get total count of blogs with filters
    const { count: totalCount } = await query

    // Check if we have any blogs
    if (totalCount === 0) {
      // Generate new blog if none exist
      await generateBlogFromSystemPrompt(supabase, systemPrompt)
      
      // Re-fetch count and data after generation
      const { count: newCount } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
      
      // Fetch the newly created blog
      const { data: newBlogs } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: sort === 'oldest' })
        .range(offset, offset + limit - 1)
      
      const responseData: Paginated<Blog> & { systemPromptSummary: string; page: number; limit: number; totalPages: number } = {
        data: newBlogs || [],
        currentPage: page,
        page,
        limit,
        perPage: limit,
        total: newCount || 0,
        totalPages: Math.ceil((newCount || 0) / limit),
        systemPromptSummary
      }
      
      const response = createSuccessResponse(responseData)
      
      // Add cache headers
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
      )
      
      return response
    }
    
    // Now build the actual data query
    let dataQuery = supabase.from('blogs').select('*')
    
    // Apply filters again for data query
    if (search) {
      dataQuery = dataQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }
    
    if (type !== 'all') {
      switch (type) {
        case 'moic':
          dataQuery = dataQuery.or('content.ilike.%moic%,content.ilike.%multiple on invested capital%')
          break
        case 'risk':
          dataQuery = dataQuery.or('content.ilike.%bear case%,content.ilike.%risk%')
          break
        case 'insight':
          dataQuery = dataQuery.not('content', 'ilike', '%moic%')
                              .not('content', 'ilike', '%bear case%')
                              .not('content', 'ilike', '%risk%')
          break
      }
    }
    
    // Apply sorting and pagination
    dataQuery = dataQuery
      .order('created_at', { ascending: sort === 'oldest' })
      .range(offset, offset + limit - 1)
    
    const { data: blogs, error } = await dataQuery
    
    if (error) {
      throw new ApiError(500, 'Failed to fetch blogs', error)
    }
    
    // Calculate total pages
    const totalPages = Math.ceil((totalCount || 0) / limit)
    
    const responseData: Paginated<Blog> & { systemPromptSummary: string; page: number; limit: number; totalPages: number } = {
      data: blogs || [],
      currentPage: page,
      page,
      limit,
      perPage: limit,
      total: totalCount || 0,
      totalPages,
      systemPromptSummary
    }
    
    const response = createSuccessResponse(responseData)
    
    // Add cache headers for better performance
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=120'
    )
    
    return response
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    checkRateLimit(`blogs-post-${ip}`, 5, 60000) // 5 requests per minute
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'kyle@zaigo.ai') {
      throw new ApiError(401, 'Unauthorized')
    }
    
    const { data: config, error: configError } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()
    
    if (configError || !config) {
      throw new ApiError(500, 'Configuration not found')
    }
    
    const aiResponse = await generateBlogContent(config.system_prompt)
    
    const { data: blog, error } = await supabase
      .from('blogs')
      .insert({
        title: `AI Investment Analysis - ${new Date().toLocaleDateString()}`,
        content: aiResponse,
      })
      .select()
      .single()
    
    if (error) {
      throw new ApiError(500, 'Failed to create blog', error)
    }
    
    return createSuccessResponse(blog, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

async function generateBlogContent(systemPrompt: string): Promise<string> {
  try {
    // Try Responses API with web search first for real-time data
    try {
      console.log('Attempting Responses API with web_search_preview for blog content...')
      const response = await openai.responses.create({
        model: 'gpt-4o',
        instructions: `${systemPrompt}\n\nIMPORTANT: Use web search to get the most current market data, stock prices, and financial news for the investment analysis.`,
        input: 'Generate comprehensive investment analysis based on current market conditions. Include real-time stock prices and recent market developments.',
        tools: [{ type: 'web_search_preview' }],
      })
      
      console.log('Responses API with web search succeeded')
      return response.output_text || 'No response generated'
    } catch (responsesError) {
      console.error('Responses API with web search error:', responsesError)
      console.log('Falling back to Chat Completions...')
      
      // Fallback to regular chat completions
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.45,
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          {
            role: 'user',
            content: 'Generate comprehensive investment analysis based on available market data.'
          }
        ],
        max_tokens: 8000,
      })
      
      return completion.choices[0].message.content || 'No response generated'
    }
  } catch (error) {
    throw new ApiError(500, 'Failed to generate AI content', error)
  }
}

async function generateBlogFromSystemPrompt(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, systemPrompt: string) {
  const aiResponse = await generateBlogContent(systemPrompt)
  
  const { error } = await supabase
    .from('blogs')
    .insert({
      title: `AI Investment Analysis - ${new Date().toLocaleDateString()}`,
      content: aiResponse,
    })
  
  if (error) {
    throw new ApiError(500, 'Failed to create initial blog', error)
  }
}

async function getSystemPromptSummary(systemPrompt: string): Promise<string> {
  // Extract a meaningful summary from the system prompt
  const lines = systemPrompt.split('\n').filter(line => line.trim())
  
  // Look for key indicators in the prompt
  const summaryLines = lines.filter(line => 
    line.includes('Framework') || 
    line.includes('Analysis') || 
    line.includes('Focus') ||
    line.includes('Strategy') ||
    line.includes('Investment')
  ).slice(0, 3)
  
  if (summaryLines.length > 0) {
    return summaryLines.join(' • ')
  }
  
  // Fallback to first meaningful line
  return lines.find(line => line.length > 20)?.substring(0, 100) || 'AI-Powered Investment Analysis'
}