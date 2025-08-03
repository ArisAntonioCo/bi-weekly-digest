"use client"

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
      { title: "AI Assistant", icon: MessageSquare, href: "/(admin)/dashboard" },
      { title: "Create Blog Post", icon: PlusCircle, href: "/(admin)/posts/create" },
      { title: "Manage Posts", icon: FileText, href: "/(admin)/posts" },
    ]
  },
  {
    title: "Newsletter",
    items: [
      { title: "Configuration", icon: Settings, href: "/(admin)/newsletter/config" },
      { title: "Send Newsletter", icon: Mail, href: "/(admin)/newsletter/send" },
      { title: "Schedule", icon: Calendar, href: "/(admin)/newsletter/schedule" },
    ]
  },
  {
    title: "Analytics",
    items: [
      { title: "Performance", icon: BarChart3, href: "/(admin)/analytics" },
      { title: "Subscribers", icon: User, href: "/(admin)/subscribers" },
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
                    <SidebarMenuButton 
                      isActive={currentPath === item.href}
                      asChild
                    >
                      <a href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
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