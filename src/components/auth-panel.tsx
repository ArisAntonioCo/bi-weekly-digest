import { Logo } from "@/components/ui/logo"

interface AuthPanelProps {
  children: React.ReactNode
}

export function AuthPanel({ children }: AuthPanelProps) {
  return (
    <div className="min-h-screen bg-muted/30 p-2">
      <div className="h-[calc(100vh-1rem)] grid lg:grid-cols-2 gap-2">
        {/* Left Panel - Branding */}
        <div 
          className="rounded-2xl p-12 flex flex-col justify-between text-white relative overflow-hidden"
          style={{
            backgroundImage: 'url(/AuthBG.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 rounded-2xl" />
          
          <div className="relative z-10">
            {/* Logo at top */}
            <Logo
              variant="md"
              href="/"
              showIcon={false}
              textClassName="text-white"
            />
          </div>
          
          <div className="relative z-10">
            {/* Heading at bottom */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              AI-Powered 3Y MOIC
              <br />
              Projections Weekly
            </h1>
          </div>
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