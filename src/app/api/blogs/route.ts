import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get system prompt from configurations table
    const { data: config } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()

    const systemPrompt = config?.system_prompt || 'You are an AI assistant that helps create engaging bi-weekly digest content.'

    // Get a brief summary of the system prompt for the header
    const systemPromptSummary = await getSystemPromptSummary(systemPrompt)

    // Check if we have existing blogs
    const { data: existingBlogs } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })

    // If no blogs exist, generate new one
    if (!existingBlogs || existingBlogs.length === 0) {
      await generateBlogFromSystemPrompt(supabase, systemPrompt)
      
      // Fetch the newly created blog
      const { data: newBlogs } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })

      return NextResponse.json({ 
        blogs: newBlogs || [],
        systemPromptSummary 
      })
    }

    return NextResponse.json({ 
      blogs: existingBlogs,
      systemPromptSummary 
    })
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
      model: 'gpt-4o-mini',
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
        model: 'gpt-4o-mini',
        temperature: 0.45,
        instructions: systemPrompt,
        input: 'Use web search to get the latest market data and provide your comprehensive analysis. Structure your response with clear sections and insights.',
        tools: [{ type: 'web_search_preview' }],
      })
      
      aiResponse = response.output_text || 'No response generated'
    } catch {
      console.log('Responses API failed, falling back to Chat Completions')
      
      // Fallback to regular chat completions
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.45,
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          {
            role: 'user',
            content: 'Provide your comprehensive analysis based on your expertise and current market conditions. Structure your response with clear sections and insights.'
          }
        ],
        max_tokens: 8000,
      })
      
      aiResponse = completion.choices[0].message.content || 'No response generated'
    }

    // Generate a title based on the content
    const titleCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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