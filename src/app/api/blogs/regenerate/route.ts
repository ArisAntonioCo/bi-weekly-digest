import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Delete existing blogs
    await supabase
      .from('blogs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
    
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

    // Try Responses API with web search first for real-time data
    let aiResponse = ''
    try {
      console.log('Attempting Responses API with web_search_preview for blog generation...')
      const response = await openai.responses.create({
        model: 'gpt-4o-search-preview',
        instructions: `${systemPrompt}\n\nIMPORTANT: Use web search to get the most current market data, stock prices, and financial news for the investment analysis.`,
        input: 'Generate comprehensive investment analysis content with current market data and recent developments.',
        tools: [{ type: 'web_search_preview' }],
      })
      
      console.log('Responses API with web search succeeded for blog')
      aiResponse = response.output_text || 'No response generated'
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

    // Insert new blog into database
    await supabase
      .from('blogs')
      .insert({
        title,
        content: aiResponse,
      })

    return NextResponse.json({ success: true, message: 'Blog content regenerated successfully' })
  } catch (error) {
    console.error('Blog regeneration error:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate blog content' },
      { status: 500 }
    )
  }
}