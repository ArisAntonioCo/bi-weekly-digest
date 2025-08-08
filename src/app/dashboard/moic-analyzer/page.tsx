'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, Sparkles } from 'lucide-react'
import { PromptInputBox } from '@/components/ui/ai-prompt-box'
import { Button } from '@/components/ui/button'
import { AIResponse } from '@/components/ui/ai-response'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedPrompts = [
  "What's a 3-year Forward MOIC Projection?",
  "Calculate 3Y MOIC projection for NVDA",
  "3Y MOIC analysis for AAPL with my 5 experts",
  "Compare 3Y MOIC: TSLA vs traditional auto"
]

export default function FinancePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (message: string) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/finance-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
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
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptClick = (promptText: string) => {
    handleSend(promptText)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex flex-col h-[calc(100vh-180px)]">
          {/* Welcome Message & Suggested Prompts */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                AI Finance Assistant
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                I can help you understand financial metrics, analyze stocks, and explain investment strategies.
              </p>
              
              <div className="w-full max-w-2xl">
                <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Try asking
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      className="text-left p-3 rounded-lg border border-border hover:border-ring hover:bg-muted/50 transition-all text-sm text-card-foreground hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto mb-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-card-foreground border border-border'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <AIResponse content={message.content} />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card rounded-lg px-4 py-3 border border-border">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area */}
          <div className="mt-auto border-t border-border pt-4">
            <PromptInputBox
              onSend={handleSend}
              isLoading={isLoading}
              placeholder="Ask about stocks, MOIC projections, or any finance question..."
              className="bg-card/50 border-border"
            />
          </div>
        </div>
      </div>
    </div>
  )
}