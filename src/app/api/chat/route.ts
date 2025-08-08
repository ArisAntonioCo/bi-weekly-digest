import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication and user permissions
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'kyle@zaigo.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, files } = await request.json()

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
      
      const currentPrompt = existingConfig?.system_prompt || 'You are an AI assistant that helps create engaging weekly digest content.'
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
          model: 'gpt-5',
          messages: refinementMessages,
          temperature: 0.45,
          max_tokens: 8000,
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
              model: 'gpt-5',
              messages: summaryMessages,
              temperature: 0.45,
              max_tokens: 8000,
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

    const systemPrompt = config?.system_prompt || 'You are an AI assistant that helps create engaging weekly digest content.'

    // Parse input modes and content
    const parseInputMode = (content: string) => {
      if (content.startsWith('[Think: ') && content.endsWith(']')) {
        return { mode: 'think', content: content.slice(8, -1) }
      }
      return { mode: 'normal', content }
    }

    const { mode, content } = parseInputMode(lastMessage?.content || '')
    
    // Check if the message requires real-time data or web search
    const needsWebSearch = (content && (
      content.toLowerCase().includes('latest') ||
      content.toLowerCase().includes('news') ||
      content.toLowerCase().includes('current') ||
      content.toLowerCase().includes('today') ||
      content.toLowerCase().includes('stock price') ||
      content.toLowerCase().includes('market') ||
      content.toLowerCase().includes('earnings') ||
      content.toLowerCase().includes('recent')
    ))

    // Generate response using Chat Completions
    // Note: Real-time web search is currently unavailable
    let enhancedSystemPrompt = `${systemPrompt}

Additionally, you can help the user update your system prompt. If they ask to update, change, or modify the system prompt, acknowledge their request and explain that they need to provide the new prompt in quotes or after a colon.`
    
    if (needsWebSearch) {
      enhancedSystemPrompt += `\n\nNote: Real-time web search is currently unavailable. I'll provide the best information based on my training data.`
    }
    
    if (mode === 'think') {
      enhancedSystemPrompt += `\n\nIMPORTANT: The user has activated "Think" mode. This requires deep, analytical thinking with enhanced processing time and thoroughness. Please:

1. **Deep Analysis**: Provide comprehensive, step-by-step reasoning with detailed explanations
2. **Multiple Perspectives**: Consider various angles, potential alternatives, and edge cases
3. **Structured Thinking**: Break down complex problems into logical components
4. **Evidence-Based**: Support conclusions with reasoning and examples where applicable
5. **Comprehensive Coverage**: Be thorough and exhaustive in your analysis
6. **Show Your Work**: Explain your thought process, assumptions, and decision-making steps
7. **Consider Implications**: Think about consequences, trade-offs, and broader impacts

Take your time to think deeply about this request and provide a thoughtful, well-reasoned response that demonstrates enhanced analytical processing.`
    }
    
    // Handle files if present
    if (files && files.length > 0) {
      enhancedSystemPrompt += `\n\nNote: The user has uploaded ${files.length} file(s). Currently, file analysis is not fully implemented, but acknowledge the files and provide relevant assistance based on the text content.`
    }

    // Update the last message to use cleaned content
    const processedMessages = messages.map((msg, index) => {
      if (index === messages.length - 1) {
        return { ...msg, content }
      }
      return msg
    })
    
    const messagesWithSystem = [
      { role: 'system' as const, content: enhancedSystemPrompt },
      ...processedMessages
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: messagesWithSystem,
      temperature: 0.45,
      max_tokens: 8000,
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