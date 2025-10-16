'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { PromptInputBox } from '@/components/ui/ai-prompt-box'
import { Button } from '@/components/ui/button'
import { AIResponse } from '@/components/ui/ai-response'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

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

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedPrompts = [
  "What's a 3-year Forward MOIC Projection?",
  "Calculate 3Y MOIC projection for NVDA",
  "3Y MOIC analysis for AAPL with my expert frameworks",
  "Compare 3Y MOIC: TSLA vs traditional auto",
  "How could recent Fed policy shifts impact 3Y MOIC for NVDA?"
]

export default function FinancePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isRestoringHistory, setIsRestoringHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const abortRef = useRef<AbortController | null>(null)
  const hydratedKeyRef = useRef<string | null>(null)

  const storageKey = useMemo(() => {
    const email = user?.email?.toLowerCase() || 'anonymous'
    return `moic-chat-history:${email}`
  }, [user?.email])

  const createMessageId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

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

  // Hydrate persisted conversation once
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hydratedKeyRef.current === storageKey) return
    try {
      const stored = window.localStorage.getItem(storageKey)
      setMessages([])

      if (!stored) {
        setIsRestoringHistory(false)
        hydratedKeyRef.current = storageKey
        return
      }

      setIsRestoringHistory(true)

      const parsed = JSON.parse(stored) as Message[]
      const hydrated = parsed.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      setMessages(hydrated)
      hydratedKeyRef.current = storageKey
      setIsRestoringHistory(false)
    } catch (error) {
      console.error('Failed to restore chat history', error)
      hydratedKeyRef.current = storageKey
      setIsRestoringHistory(false)
    }
  }, [storageKey])

  // Persist conversation per user
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hydratedKeyRef.current !== storageKey) return
    try {
      const serialisable = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
      window.localStorage.setItem(storageKey, JSON.stringify(serialisable))
    } catch (error) {
      console.error('Failed to persist chat history', error)
    }
  }, [messages, storageKey])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const handleSend = async (message: string) => {
    if (!message.trim()) return

    const requestTickers = extractTickers(message)

    const userMessage: Message = {
      id: createMessageId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

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
          id: data.message.id || createMessageId(),
          timestamp: new Date(data.message.timestamp)
        }])
      }
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        return
      }
      console.error('Chat error:', error)
      toast.error('Something went wrong fetching the analysis. Please try again.')
      const errorMessage: Message = {
        id: createMessageId(),
        content: `Sorry, I encountered an error processing your request. Please try again.\n\n${buildTickerFollowUp(requestTickers, 'Would you like me to rerun that analysis now?')}`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptClick = (promptText: string) => {
    if (isLoading) return
    handleSend(promptText)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 z-50 p-6">
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
                {isRestoringHistory ? (
                  <Skeleton className="h-20 w-full rounded-3xl" />
                ) : (
                  <PromptInputBox
                    onSend={handleSend}
                    isLoading={isLoading}
                    placeholder="Enter a stock (or stocks) ticker, or ETFs, for 3-Year Forward MOIC projections!"
                    className="bg-background border-border shadow-sm"
                  />
                )}
              </div>
              
              {/* Suggested Prompts List */}
              <div className="w-full max-w-2xl">
                {isRestoringHistory ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, idx) => (
                      <Skeleton key={idx} className="h-10 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  suggestedPrompts.map((prompt, index) => (
                    <div key={prompt}>
                      <button
                        onClick={() => handlePromptClick(prompt)}
                        disabled={isLoading}
                        className="group w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-sm rounded-lg flex items-center justify-between disabled:opacity-60 disabled:pointer-events-none"
                      >
                        <span>{prompt}</span>
                        <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                      </button>
                      {index < suggestedPrompts.length - 1 && (
                        <div className="h-px bg-border/50 mx-4" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages Area */}
          {messages.length > 0 && (
            <div className="flex flex-col flex-1 pt-24">
              {/* Messages container with scroll */}
              <div className="flex-1 overflow-y-auto pb-4 px-6">
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
              
              {/* Bottom section */}
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
                      {isRestoringHistory ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, idx) => (
                            <Skeleton key={idx} className="h-10 w-full rounded-lg" />
                          ))}
                        </div>
                      ) : (
                        suggestedPrompts.map((prompt, index) => (
                          <div key={prompt}>
                            <button
                              onClick={() => handlePromptClick(prompt)}
                              disabled={isLoading}
                              className="group flex items-center justify-between w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-background/60 rounded-lg transition-all text-sm disabled:opacity-60 disabled:pointer-events-none"
                            >
                              <span>{prompt}</span>
                              <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </button>
                            {index < suggestedPrompts.length - 1 && (
                              <div className="h-px bg-border/30 mx-2" />
                            )}
                          </div>
                        ))
                      )}
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
