import { NextResponse, NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'
import { Paginated } from '@/types/pagination'
import { Blog } from '@/types/blog'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const sort = searchParams.get('sort') || 'latest' // 'latest' or 'oldest'
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit
    
    // Get system prompt from configurations table
    const { data: config } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()

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
      
      // Re-fetch count after generation
      const { count: newCount } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
      
      // Fetch the newly created blog with pagination
      const { data: newBlogs } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: sort === 'oldest' })
        .range(offset, offset + limit - 1)

      const paginatedResponse: Paginated<Blog> = {
        data: newBlogs || [],
        currentPage: page,
        perPage: limit,
        total: newCount || 0,
        lastPage: Math.ceil((newCount || 0) / limit),
        next: page < Math.ceil((newCount || 0) / limit) ? page + 1 : undefined,
        prev: page > 1 ? page - 1 : undefined,
      }

      const response = NextResponse.json({ 
        ...paginatedResponse,
        systemPromptSummary 
      })
      
      // Add cache headers
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
      )
      
      return response
    }

    // Build the main query with filters
    let blogsQuery = supabase.from('blogs').select('*')
    
    // Add search filter if provided
    if (search) {
      blogsQuery = blogsQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }
    
    // Add type filter if provided
    if (type !== 'all') {
      switch (type) {
        case 'moic':
          blogsQuery = blogsQuery.or('content.ilike.%moic%,content.ilike.%multiple on invested capital%')
          break
        case 'risk':
          blogsQuery = blogsQuery.or('content.ilike.%bear case%,content.ilike.%risk%')
          break
        case 'insight':
          blogsQuery = blogsQuery.not('content', 'ilike', '%moic%')
                                .not('content', 'ilike', '%bear case%')
                                .not('content', 'ilike', '%risk%')
          break
      }
    }
    
    // Fetch blogs with pagination using range
    const { data: blogs, error } = await blogsQuery
      .order('created_at', { ascending: sort === 'oldest' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    // Calculate pagination metadata
    const lastPage = Math.ceil((totalCount || 0) / limit)
    
    const paginatedResponse: Paginated<Blog> = {
      data: blogs || [],
      currentPage: page,
      perPage: limit,
      total: totalCount || 0,
      lastPage,
      next: page < lastPage ? page + 1 : undefined,
      prev: page > 1 ? page - 1 : undefined,
    }

    const response = NextResponse.json({ 
      ...paginatedResponse,
      systemPromptSummary 
    })
    
    // Add cache headers for better performance
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=120'
    )
    
    return response
  } catch (error) {
    console.error('Blogs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}

async function getSystemPromptSummary(systemPrompt: string) {
  try {
    const summary = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'Create a brief, concise summary (1-2 sentences max) describing what this AI assistant specializes in based on the system prompt. Focus on the key expertise and domain.'
        },
        {
          role: 'user',
          content: systemPrompt
        }
      ],
      max_tokens: 100,
    })

    return summary.choices[0].message.content || 'AI-powered analysis and insights based on current system configuration.'
  } catch (error) {
    console.error('Error generating summary:', error)
    return 'AI-powered analysis and insights based on current system configuration.'
  }
}

async function generateBlogFromSystemPrompt(supabase: Awaited<ReturnType<typeof createClient>>, systemPrompt: string) {
  try {
    let aiResponse = ''
    
    try {
      // Use Responses API for dynamic content generation
      const response = await openai.responses.create({
        model: 'gpt-4o',
        temperature: 0.45,
        instructions: systemPrompt,
        input: 'Generate comprehensive investment analysis content based on current market data.',
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
            content: systemPrompt 
          },
          {
            role: 'user',
            content: 'Generate comprehensive investment analysis content.'
          }
        ],
        max_tokens: 8000,
      })
      
      aiResponse = completion.choices[0].message.content || 'No response generated'
    }

    // Generate a title based on the content
    const titleCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'Generate a concise, engaging title for this analysis content. Maximum 60 characters.'
        },
        {
          role: 'user',
          content: aiResponse.substring(0, 500)
        }
      ],
      max_tokens: 50,
    })

    const title = titleCompletion.choices[0].message.content || 'Investment Analysis Update'

    // Insert blog into database
    await supabase
      .from('blogs')
      .insert({
        title,
        content: aiResponse,
      })

  } catch (error) {
    console.error('Error generating blog:', error)
    // Create fallback content if AI generation fails
    const fallbackBlog = {
      title: 'Welcome to Our Dynamic Blog',
      content: `# Welcome to Our Dynamic Blog

This blog is powered by AI and dynamically generates content based on our current system configuration.

## How It Works

Our blog system:
- Analyzes the current system prompt
- Identifies key themes and topics
- Generates relevant, engaging content
- Updates automatically when the system prompt changes

## Current Theme

Based on our system configuration, this blog focuses on providing insights and analysis that align with our AI assistant's current expertise and domain knowledge.

Stay tuned for more dynamic content as our system evolves!`,
    }

    await supabase
      .from('blogs')
      .insert({
        title: fallbackBlog.title,
        content: fallbackBlog.content,
      })
  }
}