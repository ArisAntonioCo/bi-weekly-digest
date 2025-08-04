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
      lastMessage.content.toLowerCase().includes('change the prompt') ||
      lastMessage.content.toLowerCase().includes('update config')
    )

    if (isSystemPromptUpdate) {
      // Get the current system prompt first
      const { data: existingConfig } = await supabase
        .from('configurations')
        .select('*')
        .single()
      
      const currentPrompt = existingConfig?.system_prompt || 'You are an AI assistant that helps create engaging bi-weekly digest content.'
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
          model: 'gpt-4o-mini',
          messages: refinementMessages,
          temperature: 0.3,
          max_tokens: 4000,
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
              model: 'gpt-4o-mini',
              messages: summaryMessages,
              temperature: 0.5,
              max_tokens: 500,
            })
            
            const changeSummary = summaryResponse.choices[0].message.content || 'System prompt has been updated based on your request.'
            
            return NextResponse.json({
              message: {
                id: Date.now().toString(),
                content: `System prompt has been successfully refined! Here's what changed:\n\n${changeSummary}\n\nI will now use this updated prompt for all future conversations.`,
                sender: 'assistant',
                timestamp: new Date(),
              }
            })
          } else {
            console.error('Error updating system prompt:', error)
            return NextResponse.json({
              message: {
                id: Date.now().toString(),
                content: 'Sorry, I encountered an error updating the system prompt. Please try again or contact support.',
                sender: 'assistant',
                timestamp: new Date(),
              }
            })
          }
        } else {
          return NextResponse.json({
            message: {
              id: Date.now().toString(),
              content: 'I couldn\'t generate a refined prompt. Please try rephrasing your request.',
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
            content: 'Sorry, I encountered an error while refining the system prompt. Please try again.',
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