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
  User,
  Calendar,
  LogOut,
  Loader2,
  BookOpen,
  Users
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { logout } from '@/app/(auth)/login/actions'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'

const sidebarItems = [
  {
    title: "Content Management",
    items: [
      { title: "AI Assistant", icon: MessageSquare, href: "/admin/dashboard" },
      { title: "Blog", icon: BookOpen, href: "/admin/blogs" },
      { title: "Expert Frameworks", icon: Users, href: "/admin/experts" },
    ]
  },
  {
    title: "Newsletter",
    items: [
      { title: "Configuration", icon: Settings, href: "/admin/newsletter/config" },
      { title: "Schedule", icon: Calendar, href: "/admin/newsletter/schedule" },
      { title: "Elite Members", icon: User, href: "/admin/members" },
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
      // Reset theme to default on logout
      localStorage.removeItem('bi-weekly-digest-theme')
      document.documentElement.classList.remove('dark')
      
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center px-4 h-16 min-h-16 max-h-16 flex-shrink-0">
          <Logo 
            variant="sm"
            href="/admin/dashboard"
            showIcon={false}
          />
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
        <div className="p-2 space-y-2">
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeSwitcher />
          </div>
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