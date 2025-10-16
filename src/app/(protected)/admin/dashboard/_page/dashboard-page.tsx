"use client"

import { useState, useEffect } from 'react'
import { ChatMessages } from '../_sections/chat-messages'
import { InputArea } from '../_sections/input-area'
import { Message } from '../_sections/types'

const TICKER_REGEX = /\$[A-Za-z]{1,6}(?:\.[A-Za-z]{1,2})?/g

const extractTickers = (text: string): string[] => {
  if (!text) return []
  const matches = text.match(TICKER_REGEX)
  if (!matches) return []
  return Array.from(new Set(matches.map(match => match.replace('$', '').toUpperCase())))
}

const buildTickerFollowUp = (tickers: string[], fallback: string): string => {
  const unique = Array.from(new Set(tickers.map(t => t.toUpperCase())))
  if (unique.length === 0) {
    return fallback
  }
  if (unique.length === 1) {
    return `Would you like me to outline next steps for $${unique[0]}?`
  }
  if (unique.length === 2) {
    return `Would you like me to compare the 3-year MOIC of $${unique[0]} to $${unique[1]} next?`
  }
  const rest = unique.slice(1)
  const formattedRest = rest.length === 1
    ? `$${rest[0]}`
    : `${rest.slice(0, -1).map(t => `$${t}`).join(', ')} or $${rest[rest.length - 1]}`
  return `Would you like me to compare the 3-year MOIC of $${unique[0]} to ${formattedRest} next?`
}

export function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  useEffect(() => {
    setIsClient(true)
    setMessages([{
      id: '1',
      content: 'Enter any US-listed public equities (stocks) or ETFs, whether individually, or multiple, for comparison purposes.\nChoose 3-5 experts to apply their frameworks.\nUnlock your proprietary 3-year return on invested capital.',
      sender: 'assistant',
      timestamp: new Date()
    }])
  }, [])

  const handleSendMessage = async (content: string) => {
    // If already loading, stop the current request
    if (isLoading && abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
      return
    }

    const requestTickers = extractTickers(content)

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Create new AbortController for this request
    const controller = new AbortController()
    setAbortController(controller)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.sender,
            content: msg.content
          }))
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      if (data.message) {
        setMessages(prev => [...prev, {
          ...data.message,
          timestamp: new Date(data.message.timestamp)
        }])
      }
    } catch (error) {
      // Don't show error if request was aborted by user
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Chat error:', error)
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `Sorry, I encountered an error processing your request. Please try again.\n\n${buildTickerFollowUp(requestTickers, 'Would you like me to retry that request now?')}`,
          sender: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col min-h-0">
      <ChatMessages 
        messages={messages} 
        isLoading={isLoading} 
        isClient={isClient} 
      />
      <InputArea 
        onSend={handleSendMessage} 
        isLoading={isLoading}
        onStop={handleStopGeneration}
      />
    </div>
  )
}
