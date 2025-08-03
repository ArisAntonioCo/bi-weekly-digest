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

    // Check if the user is asking to update the system prompt
    const lastMessage = messages[messages.length - 1]
    const isSystemPromptUpdate = lastMessage?.content && (
      lastMessage.content.toLowerCase().includes('update system prompt') ||
      lastMessage.content.toLowerCase().includes('change system prompt') ||
      lastMessage.content.toLowerCase().includes('new system prompt') ||
      lastMessage.content.toLowerCase().includes('update the prompt') ||
      lastMessage.content.toLowerCase().includes('change the prompt')
    )

    if (isSystemPromptUpdate) {
      // Extract the new prompt from the message
      const promptMatch = lastMessage.content.match(/["']([^"']+)["']|:\s*([\s\S]+)/)
      if (promptMatch) {
        const newPrompt = promptMatch[1] || promptMatch[2]?.trim()
        
        if (newPrompt) {
          // Update the system prompt in the database
          const { error } = await supabase
            .from('configurations')
            .upsert({
              id: '00000000-0000-0000-0000-000000000001',
              system_prompt: newPrompt,
              updated_at: new Date().toISOString()
            })

          if (!error) {
            return NextResponse.json({
              message: {
                id: Date.now().toString(),
                content: 'System prompt has been successfully updated! I will now use the new prompt for all future conversations.',
                sender: 'assistant',
                timestamp: new Date(),
              }
            })
          }
        }
      }
      
      return NextResponse.json({
        message: {
          id: Date.now().toString(),
          content: 'To update the system prompt, please provide the new prompt in quotes or after a colon. For example: "Update system prompt: Your new prompt here" or Update system prompt "Your new prompt here"',
          sender: 'assistant',
          timestamp: new Date(),
        }
      })
    }

    // Get system prompt from configurations table
    const { data: config } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()

    const systemPrompt = config?.system_prompt || 'You are an AI assistant that helps create engaging bi-weekly digest content.'

    // Check if the message requires real-time data or web search
    const needsWebSearch = lastMessage?.content && (
      lastMessage.content.toLowerCase().includes('latest') ||
      lastMessage.content.toLowerCase().includes('news') ||
      lastMessage.content.toLowerCase().includes('current') ||
      lastMessage.content.toLowerCase().includes('today') ||
      lastMessage.content.toLowerCase().includes('stock price') ||
      lastMessage.content.toLowerCase().includes('market') ||
      lastMessage.content.toLowerCase().includes('earnings') ||
      lastMessage.content.toLowerCase().includes('recent')
    )

    try {
      // Use the Responses API with web search tool when needed
      if (needsWebSearch) {
        // Build conversation history for context
        const conversationHistory = messages.slice(0, -1).map(msg => 
          `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n\n')

        const instructions = `${systemPrompt}

Additionally, you can help the user update your system prompt. If they ask to update, change, or modify the system prompt, acknowledge their request and explain that they need to provide the new prompt in quotes or after a colon.

Previous conversation:
${conversationHistory}

Use the web search tool to find the latest information when answering questions about current events, stock prices, or recent news.`

        const response = await openai.responses.create({
          model: 'gpt-4o-mini',
          instructions: instructions,
          input: lastMessage.content,
          tools: [{ type: 'web_search_preview' }],
        })

        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            content: response.output_text || 'I apologize, but I was unable to generate a response.',
            sender: 'assistant',
            timestamp: new Date(),
          }
        })
      } else {
        // Use regular chat completions for non-web-search queries
        const enhancedSystemPrompt = `${systemPrompt}

Additionally, you can help the user update your system prompt. If they ask to update, change, or modify the system prompt, acknowledge their request and explain that they need to provide the new prompt in quotes or after a colon.`

        const messagesWithSystem = [
          { role: 'system' as const, content: enhancedSystemPrompt },
          ...messages
        ]

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messagesWithSystem,
          temperature: 0.7,
          max_tokens: 2000,
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
      }
    } catch (apiError: unknown) {
      // Fallback to chat completions if Responses API fails
      console.log('Responses API failed, falling back to Chat Completions:', apiError instanceof Error ? apiError.message : 'Unknown error')
      
      const enhancedSystemPrompt = `${systemPrompt}

Additionally, you can help the user update your system prompt. If they ask to update, change, or modify the system prompt, acknowledge their request and explain that they need to provide the new prompt in quotes or after a colon.

Note: Real-time web search is currently unavailable. I'll provide the best information based on my training data.`

      const messagesWithSystem = [
        { role: 'system' as const, content: enhancedSystemPrompt },
        ...messages
      ]

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 2000,
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
    }
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