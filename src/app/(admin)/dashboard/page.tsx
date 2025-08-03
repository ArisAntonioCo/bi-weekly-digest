"use client"

import { useState, useEffect } from 'react'
import { ChatMessages } from './_sections/chat-messages'
import { InputArea } from './_sections/input-area'
import { Message } from './_sections/types'

export default function AdminDashboard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setMessages([{
      id: '1',
      content: 'Welcome to your BI-Weekly Digest dashboard! I can help you create and manage content, configure your newsletter settings, and analyze your digest performance. What would you like to work on today?',
      sender: 'assistant',
      timestamp: new Date()
    }])
  }, [])

  const handleSendMessage = async (content: string, files?: File[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you want to work on: "${content}". I can help you with content creation, newsletter configuration, and digest management. What specific task would you like to start with?`,
        sender: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex h-full w-full flex-col">
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