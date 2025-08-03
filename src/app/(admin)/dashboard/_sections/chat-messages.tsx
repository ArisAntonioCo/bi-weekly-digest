"use client"

import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, User } from 'lucide-react'

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
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        {isClient && messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'assistant' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessageSquare className="h-4 w-4" />
              </div>
            )}
            <Card
              className={`max-w-[80%] ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <CardContent className="p-4">
                <p className="text-sm">{message.content}</p>
                <p className="mt-2 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
            {message.sender === 'user' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {isClient && isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
      </div>
    </div>
  )
}