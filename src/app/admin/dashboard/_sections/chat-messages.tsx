"use client"

import { Card, CardContent } from '@/components/ui/card'
import { TypingIndicator } from '@/components/ui/typing-indicator'
import { MessageSquare, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { useEffect, useRef } from 'react'
import type { Components } from 'react-markdown'
import { Message } from '@/types/chat'

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
    <div className="flex-1 overflow-auto p-2 md:p-4 min-h-0">
      <div className="mx-auto max-w-4xl space-y-2 md:space-y-3">
        {isClient && messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 md:gap-3 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'assistant' && (
              <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-primary text-primary-foreground mt-1 flex-shrink-0">
                <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
              </div>
            )}
            <Card
              className={`max-w-[90%] md:max-w-[85%] min-w-0 w-fit py-0 ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-2xl'
                  : 'bg-muted rounded-2xl'
              }`}
            >
              <CardContent className="px-3 py-1.5 md:px-3 md:py-2">
                <div className="text-xs md:text-sm">
                  {message.sender === 'assistant' ? (
                    <div className="prose prose-xs md:prose-sm max-w-none dark:prose-invert prose-compact">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          h1: ({ children }) => <h1 className="text-base md:text-lg font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm md:text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs md:text-sm font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-xs md:text-sm font-medium mb-2 mt-2 first:mt-0">{children}</h4>,
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc mb-3 space-y-1 pl-6 ml-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal mb-3 space-y-1 pl-6 ml-2">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
                          code: ({ children, className, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '')
                            const isInline = !match
                            return isInline ? (
                              <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                            ) : (
                              <code className="block bg-muted-foreground/10 p-2 rounded text-xs font-mono overflow-x-auto" {...props}>{children}</code>
                            )
                          },
                          pre: ({ children }) => <pre className="bg-muted-foreground/10 p-3 rounded overflow-x-auto mb-3">{children}</pre>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-muted-foreground/30 pl-4 mb-3 italic bg-muted-foreground/5 py-2">{children}</blockquote>,
                          table: ({ children }) => <table className="w-full border-collapse border border-muted-foreground/30 mb-3">{children}</table>,
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
              </CardContent>
            </Card>
            {message.sender === 'user' && (
              <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-muted mt-1 flex-shrink-0">
                <User className="h-3 w-3 md:h-4 md:w-4" />
              </div>
            )}
          </div>
        ))}
        {isClient && isLoading && (
          <div className="flex items-start gap-2 md:gap-3">
            <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-primary text-primary-foreground mt-1 flex-shrink-0">
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
            </div>
            <Card className="bg-muted rounded-2xl py-0">
              <CardContent className="px-3 py-1.5 md:px-3 md:py-2">
                <TypingIndicator />
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}