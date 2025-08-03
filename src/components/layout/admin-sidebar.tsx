"use client"

import Link from 'next/link'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarHeader,
} from '@/components/ui/sidebar'
import { 
  MessageSquare, 
  Settings, 
  FileText, 
  Mail, 
  BarChart3, 
  User,
  Calendar,
  PlusCircle
} from 'lucide-react'

const sidebarItems = [
  {
    title: "Content Management",
    items: [
      { title: "AI Assistant", icon: MessageSquare, href: "/dashboard" },
      { title: "Create Blog Post", icon: PlusCircle, href: "/posts/create" },
      { title: "Manage Posts", icon: FileText, href: "/posts" },
    ]
  },
  {
    title: "Newsletter",
    items: [
      { title: "Configuration", icon: Settings, href: "/newsletter/config" },
      { title: "Send Newsletter", icon: Mail, href: "/newsletter/send" },
      { title: "Schedule", icon: Calendar, href: "/newsletter/schedule" },
    ]
  },
  {
    title: "Analytics",
    items: [
      { title: "Performance", icon: BarChart3, href: "/analytics" },
      { title: "Subscribers", icon: User, href: "/subscribers" },
    ]
  }
]

interface AdminSidebarProps {
  currentPath?: string
}

export function AdminSidebar({ currentPath }: AdminSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 flex-shrink-0" style={{ height: '64px', minHeight: '64px', maxHeight: '64px' }}>
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
                    <SidebarMenuButton 
                      isActive={currentPath === item.href}
                      asChild
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}