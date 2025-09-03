'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { PromptInputBox } from '@/components/ui/ai-prompt-box'
import { Button } from '@/components/ui/button'
import { AIResponse } from '@/components/ui/ai-response'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { createClient } from '@/utils/supabase/client'

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
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Get user initials for avatar
  const getUserInitials = (email: string): string => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  // Get user name from email
  const getUserName = (email: string): string => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    }
    return email.split('@')[0]
  }

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [supabase.auth])

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
      <div className="absolute top-0 left-0 p-6">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col min-h-screen">
          {/* Welcome Message & Suggested Prompts */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              {/* Animated Orb */}
              <AnimatedOrb className="mb-6" />
              
              {/* Greeting */}
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Good Morning{user?.email ? `, ${getUserName(user.email)}` : ''}
              </h1>
              <h2 className="text-xl text-muted-foreground mb-12">
                How Can I Assist You Today?
              </h2>
              
              {/* Centered Prompt Box */}
              <div className="w-full max-w-2xl mb-8">
                <PromptInputBox
                  onSend={handleSend}
                  isLoading={isLoading}
                  placeholder="Enter a stock (or stocks) ticker, or ETFs, for 3-Year Forward MOIC projections!"
                  className="bg-background border-border shadow-sm"
                />
              </div>
              
              {/* Suggested Prompts List */}
              <div className="w-full max-w-2xl">
                {suggestedPrompts.map((prompt, index) => (
                  <div key={prompt}>
                    <button
                      onClick={() => handlePromptClick(prompt)}
                      className="group w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-sm rounded-lg flex items-center justify-between"
                    >
                      <span>{prompt}</span>
                      <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                    </button>
                    {index < suggestedPrompts.length - 1 && (
                      <div className="h-px bg-border/50 mx-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          {messages.length > 0 && (
            <div className="fixed inset-0 flex flex-col">
              {/* Messages container with scroll */}
              <div className="flex-1 overflow-y-auto pt-20 pb-4 px-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* AI Avatar */}
                      {message.role === 'assistant' && (
                        <AnimatedOrb size="sm" className="flex-shrink-0" />
                      )}
                      
                      {/* Message content */}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-muted text-foreground'
                            : 'bg-background text-foreground'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <AIResponse content={message.content} />
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                      
                      {/* User Avatar */}
                      {message.role === 'user' && user?.email && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-indigo-500 text-white text-xs">
                            {getUserInitials(user.email)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <AnimatedOrb size="sm" className="flex-shrink-0" />
                      <div className="bg-background rounded-2xl px-4 py-3">
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
              </div>
              
              {/* Fixed bottom section */}
              <div className="mt-auto bg-background">
                {/* Collapsible Suggested prompts */}
                <div className="max-w-2xl mx-auto px-6">
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>Suggested prompts</span>
                    {showSuggestions ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </button>
                  
                  {showSuggestions && (
                    <div className="border border-border/50 rounded-xl bg-muted/20 p-2 mb-4">
                      {suggestedPrompts.map((prompt, index) => (
                        <div key={prompt}>
                          <button
                            onClick={() => handlePromptClick(prompt)}
                            className="group flex items-center justify-between w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-background/60 rounded-lg transition-all text-sm"
                          >
                            <span>{prompt}</span>
                            <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                          </button>
                          {index < suggestedPrompts.length - 1 && (
                            <div className="h-px bg-border/30 mx-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Sticky Input Area */}
                  <div className="pb-6 pt-2">
                    <PromptInputBox
                      onSend={handleSend}
                      isLoading={isLoading}
                      placeholder="Ask about MOIC projections, stock analysis, or investment comparisons..."
                      className="bg-background border-border shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}