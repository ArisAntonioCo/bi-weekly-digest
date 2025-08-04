"use client"

import { useState, useEffect } from 'react'
import { ChatMessages } from '../_sections/chat-messages'
import { InputArea } from '../_sections/input-area'
import { Message } from '../_sections/types'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isEmailingPrompt, setIsEmailingPrompt] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setMessages([{
      id: '1',
      content: 'Welcome to your BI-Weekly Digest dashboard! I can help you create and manage content, configure your newsletter settings, and analyze your digest performance. What would you like to work on today?',
      sender: 'assistant',
      timestamp: new Date()
    }])
  }, [])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

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
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSystemPrompt = async () => {
    setIsEmailingPrompt(true)
    
    try {
      const response = await fetch('/api/email-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (response.ok) {
        const successMessage: Message = {
          id: Date.now().toString(),
          content: '✅ AI analysis has been generated and emailed successfully to kulaizke@gmail.com! The AI used the current system prompt to generate insights and recommendations.',
          sender: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, successMessage])
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `❌ Failed to email system prompt: ${result.error}`,
          sender: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '❌ Failed to email system prompt. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsEmailingPrompt(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col min-h-0">
      <div className="flex justify-end p-4 border-b">
        <Button
          onClick={handleEmailSystemPrompt}
          disabled={isEmailingPrompt}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          {isEmailingPrompt ? 'Generating & Sending...' : 'Email AI Analysis'}
        </Button>
      </div>
      <ChatMessages 
        messages={messages} 
        isLoading={isLoading} 
        isClient={isClient} 
      />
      <InputArea 
        onSend={handleSendMessage} 
        isLoading={isLoading} 
      />
    </div>
  )
}