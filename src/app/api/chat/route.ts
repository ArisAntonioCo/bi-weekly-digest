import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // Get system prompt from configurations table
    const { data: config } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()

    const systemPrompt = config?.system_prompt || 'You are an AI assistant that helps create engaging bi-weekly digest content. Your role is to summarize recent updates, highlight key achievements, and provide valuable insights in a concise and readable format.'

    // Add system prompt to messages
    const messagesWithSystem = [
      { role: 'system' as const, content: systemPrompt },
      ...messages
    ]

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 1000,
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