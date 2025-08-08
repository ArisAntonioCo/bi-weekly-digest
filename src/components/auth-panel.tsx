import Link from "next/link"
import { TrendingUp } from "lucide-react"

interface AuthPanelProps {
  children: React.ReactNode
}

export function AuthPanel({ children }: AuthPanelProps) {
  return (
    <div className="min-h-screen bg-muted/30 p-2">
      <div className="h-[calc(100vh-1rem)] grid lg:grid-cols-2 gap-2">
        {/* Left Panel - Branding */}
        <div className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-2xl p-12 flex flex-col justify-center text-primary-foreground">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="bg-primary-foreground text-primary flex size-10 items-center justify-center rounded-md">
              <TrendingUp className="size-6" />
            </div>
            <span className="text-2xl font-semibold">Weekly Digest</span>
          </Link>
          
          <h1 className="text-5xl font-bold mb-4">Predictive Finance</h1>
          <p className="text-xl opacity-90">
            AI-powered investment insights and market analysis delivered to your inbox.
          </p>
        </div>

        {/* Right Panel - Auth Forms */}
        <div className="bg-card rounded-2xl p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}