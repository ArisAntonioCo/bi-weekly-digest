"use client"

import { useState } from 'react'
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarHeader, 
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { PromptInputBox } from '@/components/ui/ai-prompt-box'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MessageSquare, 
  Settings, 
  FileText, 
  Mail, 
  BarChart3, 
  User,
  PlusCircle,
  Calendar
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

export default function AdminDashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to your BI-Weekly Digest dashboard! I can help you create and manage content, configure your newsletter settings, and analyze your digest performance. What would you like to work on today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string, files?: File[]) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI response (replace with actual OpenAI integration)
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

  const sidebarItems = [
    {
      title: "Content Management",
      items: [
        { title: "AI Chat", icon: MessageSquare, isActive: true },
        { title: "Create Blog Post", icon: PlusCircle },
        { title: "Manage Posts", icon: FileText },
      ]
    },
    {
      title: "Newsletter",
      items: [
        { title: "Configuration", icon: Settings },
        { title: "Send Newsletter", icon: Mail },
        { title: "Schedule", icon: Calendar },
      ]
    },
    {
      title: "Analytics",
      items: [
        { title: "Performance", icon: BarChart3 },
        { title: "Subscribers", icon: User },
      ]
    }
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">BI-Weekly Digest</span>
                <span className="text-xs text-muted-foreground">Content Manager</span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            {sidebarItems.map((section, index) => (
              <SidebarGroup key={index}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item, itemIndex) => (
                      <SidebarMenuItem key={itemIndex}>
                        <SidebarMenuButton isActive={item.isActive}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          {/* Header */}
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">AI Content Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage your bi-weekly digest content
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-6">
              <div className="mx-auto max-w-4xl space-y-4">
                {messages.map((message) => (
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
                {isLoading && (
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

            {/* Input Area */}
            <div className="border-t bg-background p-6">
              <div className="mx-auto max-w-4xl">
                <PromptInputBox
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  placeholder="Ask me to help you create content, configure settings, or manage your newsletter..."
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}