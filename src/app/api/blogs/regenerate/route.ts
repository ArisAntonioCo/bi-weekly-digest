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

    const systemPrompt = config?.system_prompt || 'You are an AI assistant that helps create engaging bi-weekly digest content.'

    // Generate new blog content
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