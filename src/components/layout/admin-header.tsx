"use client"

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

export function AdminHeader() {
  return (
    <header className="flex items-center gap-4 border-b bg-background px-4 py-4 flex-shrink-0">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-base md:text-lg font-semibold">AI Content Assistant</h1>
          <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Create and manage your bi-weekly digest content</p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button variant="outline" size="sm" className="sm:hidden">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}