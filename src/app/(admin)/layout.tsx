"use client"

import { ReactNode } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AdminHeader } from '@/components/layout/admin-header'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col w-full min-h-0">
            <AdminHeader />
            <SidebarInset className="flex flex-1 flex-col w-full min-h-0 scrollable-content">
              <div className="flex flex-1 flex-col h-full overflow-y-auto">
                {children}
              </div>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}