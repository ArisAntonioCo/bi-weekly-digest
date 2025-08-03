"use client"

import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { useEffect, useRef } from 'react'
import type { Components } from 'react-markdown'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  isClient: boolean
}

export function ChatMessages({ messages, isLoading, isClient }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-auto p-4 min-h-0">
      <div className="mx-auto max-w-4xl space-y-3">
        {isClient && messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'assistant' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground mt-1 flex-shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
            )}
            <Card
              className={`max-w-[85%] min-w-0 w-fit ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <CardContent className="p-3">
                <div className="text-sm">
                  {message.sender === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-compact">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-1 mt-2 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold mb-1 mt-2 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1 first:mt-0">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-sm font-medium mb-1 mt-1 first:mt-0">{children}</h4>,
                          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="leading-snug">{children}</li>,
                          code: ({ children, className, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '')
                            const isInline = !match
                            return isInline ? (
                              <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                            ) : (
                              <code className="block bg-muted-foreground/10 p-2 rounded text-xs font-mono overflow-x-auto" {...props}>{children}</code>
                            )
                          },
                          pre: ({ children }) => <pre className="bg-muted-foreground/10 p-2 rounded overflow-x-auto mb-1">{children}</pre>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-muted-foreground/30 pl-3 mb-1 italic">{children}</blockquote>,
                          table: ({ children }) => <table className="w-full border-collapse border border-muted-foreground/30 mb-1">{children}</table>,
                          thead: ({ children }) => <thead className="bg-muted-foreground/10">{children}</thead>,
                          tbody: ({ children }) => <tbody>{children}</tbody>,
                          tr: ({ children }) => <tr className="border-b border-muted-foreground/20">{children}</tr>,
                          th: ({ children }) => <th className="border border-muted-foreground/30 px-2 py-1 text-left text-xs font-semibold">{children}</th>,
                          td: ({ children }) => <td className="border border-muted-foreground/30 px-2 py-1 text-xs">{children}</td>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                        } as Components}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                <p className="mt-2 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
            {message.sender === 'user' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted mt-1 flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {isClient && isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground mt-1 flex-shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <Card className="bg-muted">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60" />
                  <div className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60" style={{ animationDelay: '0.2s' }} />
                  <div className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60" style={{ animationDelay: '0.4s' }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}