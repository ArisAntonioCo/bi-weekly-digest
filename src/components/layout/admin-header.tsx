"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Settings, 
  MessageSquare, 
  BookOpen, 
  BarChart3, 
  User, 
  Calendar,
  Mail,
  Brain,
  TrendingUp
} from 'lucide-react'

interface PageConfig {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  action?: {
    label: string
    href?: string
    onClick?: string
    icon: React.ComponentType<{ className?: string }>
  }
}

const pageConfigs: Record<string, PageConfig> = {
  '/dashboard': {
    title: 'AI Assistant',
    description: 'Chat with Kyle\'s investment analysis AI',
    icon: MessageSquare,
    badge: 'Active',
    action: {
      label: 'Email AI Analysis',
      onClick: 'emailAnalysis',
      icon: Mail
    }
  },
  '/blogs': {
    title: 'Investment Analysis Blog',
    description: 'Dynamic insights from our AI analyst',
    icon: BookOpen,
    badge: 'Auto-Generated',
    action: {
      label: 'Refresh Content',
      href: '/blogs',
      icon: TrendingUp
    }
  },
  '/newsletter/config': {
    title: 'AI Configuration',
    description: 'Customize Kyle\'s AI assistant behavior',
    icon: Brain,
    badge: 'System Prompt',
    action: {
      label: 'View Blogs',
      href: '/blogs',
      icon: BookOpen
    }
  },
  '/newsletter/send': {
    title: 'Send Newsletter',
    description: 'Compose and send bi-weekly digest',
    icon: Mail,
    badge: 'Draft'
  },
  '/newsletter/schedule': {
    title: 'Newsletter Schedule',
    description: 'Automate bi-weekly newsletter delivery',
    icon: Calendar,
    badge: 'Automated'
  },
  '/analytics': {
    title: 'Performance Analytics',
    description: 'Track engagement and AI usage metrics',
    icon: BarChart3,
    badge: 'Live Data'
  },
  '/subscribers': {
    title: 'Subscriber Management',
    description: 'Manage newsletter recipients and preferences',
    icon: User,
    badge: 'Active Users'
  }
}

const defaultConfig: PageConfig = {
  title: 'BI-Weekly Digest',
  description: 'Kyle\'s AI-powered content management system',
  icon: Settings,
  badge: 'Admin Panel'
}

export function AdminHeader() {
  const pathname = usePathname()
  const [isEmailingAnalysis, setIsEmailingAnalysis] = useState(false)
  const config = pageConfigs[pathname] || defaultConfig
  const IconComponent = config.icon

  const handleEmailAnalysis = async () => {
    setIsEmailingAnalysis(true)
    
    try {
      const response = await fetch('/api/email-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success('AI analysis has been generated and emailed successfully to kulaizke@gmail.com!')
      } else {
        toast.error(`Failed to email analysis: ${result.error}`)
      }
    } catch (error) {
      toast.error('Failed to email analysis. Please try again.')
    } finally {
      setIsEmailingAnalysis(false)
    }
  }

  return (
    <header className="flex items-center gap-4 border-b bg-background px-4 py-4 flex-shrink-0">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconComponent className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-semibold">{config.title}</h1>
              {config.badge && (
                <Badge variant="outline" className="text-xs">
                  {config.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              {config.description}
            </p>
          </div>
        </div>
        
        {config.action ? (
          config.action.onClick === 'emailAnalysis' ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex gap-2" 
              onClick={handleEmailAnalysis}
              disabled={isEmailingAnalysis}
            >
              <config.action.icon className="h-4 w-4" />
              {isEmailingAnalysis ? 'Generating & Sending...' : config.action.label}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <Link href={config.action.href || '#'}>
                <config.action.icon className="h-4 w-4 mr-2" />
                {config.action.label}
              </Link>
            </Button>
          )
        ) : (
          <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
            <Link href="/newsletter/config">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        )}
        
        {/* Mobile version */}
        {config.action && config.action.onClick === 'emailAnalysis' ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="sm:hidden" 
            onClick={handleEmailAnalysis}
            disabled={isEmailingAnalysis}
          >
            <config.action.icon className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="sm:hidden" asChild>
            <Link href={config.action?.href || "/newsletter/config"}>
              {config.action?.icon ? (
                <config.action.icon className="h-4 w-4" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}