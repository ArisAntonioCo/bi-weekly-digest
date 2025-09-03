"use client"

import { Card, CardContent } from '@/components/ui/card'
import { TypingIndicator } from '@/components/ui/typing-indicator'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { useEffect, useRef } from 'react'
import type { Components } from 'react-markdown'
import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'

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
        {isClient && messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-2 md:gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {message.sender === 'assistant' && (
              <div className="relative flex items-center justify-center mt-1 flex-shrink-0">
                <AnimatedOrb size="sm" />
              </div>
            )}
            <Card
              className={cn(
                "max-w-[90%] md:max-w-[85%] min-w-0 w-fit py-0 rounded-2xl border-0 shadow-none transition-all duration-200",
                message.sender === 'user'
                  ? 'bg-black text-white'
                  : 'bg-muted/50'
              )}
            >
              <CardContent className="px-3 py-1.5 md:px-3 md:py-2">
                <div className="text-xs md:text-sm">
                  {message.sender === 'assistant' ? (
                    <div className="prose prose-xs md:prose-sm max-w-none dark:prose-invert prose-compact">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          h1: ({ children }) => <h1 className="text-base md:text-lg font-medium mb-3 mt-4 first:mt-0 text-foreground">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm md:text-base font-medium mb-2 mt-3 first:mt-0 text-foreground">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs md:text-sm font-medium mb-2 mt-3 first:mt-0 text-foreground">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-xs md:text-sm font-normal mb-2 mt-2 first:mt-0 text-foreground">{children}</h4>,
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-muted-foreground">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc mb-3 space-y-1 pl-6 ml-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal mb-3 space-y-1 pl-6 ml-2">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed pl-1 text-muted-foreground">{children}</li>,
                          code: ({ children, className, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '')
                            const isInline = !match
                            return isInline ? (
                              <code className="bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-md text-xs font-mono text-foreground" {...props}>{children}</code>
                            ) : (
                              <code className="block bg-black/5 dark:bg-white/5 p-3 rounded-lg text-xs font-mono overflow-x-auto text-foreground" {...props}>{children}</code>
                            )
                          },
                          pre: ({ children }) => <pre className="bg-black/5 dark:bg-white/5 p-4 rounded-lg overflow-x-auto mb-3">{children}</pre>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-black/20 dark:border-white/20 pl-4 mb-3 italic text-muted-foreground">{children}</blockquote>,
                          table: ({ children }) => <table className="w-full border-collapse mb-3">{children}</table>,
                          thead: ({ children }) => <thead className="border-b border-black/10 dark:border-white/10">{children}</thead>,
                          tbody: ({ children }) => <tbody>{children}</tbody>,
                          tr: ({ children }) => <tr className="border-b border-black/5 dark:border-white/5">{children}</tr>,
                          th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-medium text-foreground">{children}</th>,
                          td: ({ children }) => <td className="px-3 py-2 text-xs text-muted-foreground">{children}</td>,
                          strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
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
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-black text-white mt-1 flex-shrink-0">
                <User className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            )}
          </div>
        ))}
        {isClient && isLoading && (
          <div className="flex items-start gap-2 md:gap-3">
            <div className="relative flex items-center justify-center mt-1 flex-shrink-0">
              <AnimatedOrb size="sm" />
            </div>
            <Card className="bg-muted/50 rounded-2xl py-0 border-0 shadow-none">
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