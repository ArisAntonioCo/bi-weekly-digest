import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - BI-Weekly Digest',
  description: 'Content management and newsletter administration',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}