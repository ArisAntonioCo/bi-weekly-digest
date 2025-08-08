"use client"

import Link from 'next/link'
import { useState } from 'react'
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
  SidebarFooter,
} from '@/components/ui/sidebar'
import { 
  MessageSquare, 
  Settings, 
  FileText, 
  User,
  Calendar,
  LogOut,
  Loader2,
  BookOpen
} from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'

const sidebarItems = [
  {
    title: "Content Management",
    items: [
      { title: "AI Assistant", icon: MessageSquare, href: "/admin/dashboard" },
      { title: "Blog", icon: BookOpen, href: "/admin/blogs" },
    ]
  },
  {
    title: "Newsletter",
    items: [
      { title: "Configuration", icon: Settings, href: "/admin/newsletter/config" },
      { title: "Schedule", icon: Calendar, href: "/admin/newsletter/schedule" },
      { title: "Subscribers", icon: User, href: "/admin/subscribers" },
    ]
  }
]

interface AdminSidebarProps {
  currentPath?: string
}

export function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 h-16 min-h-16 max-h-16 flex-shrink-0">
          <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="h-3 w-3 md:h-4 md:w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-semibold">3Y MOIC</span>
            <span className="text-xs text-muted-foreground hidden sm:block">Content Manager</span>
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

      <SidebarFooter className="border-t">
        <div className="p-2">
          <SidebarMenuButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </>
            )}
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}