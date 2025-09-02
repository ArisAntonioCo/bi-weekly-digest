import { Logo } from "@/components/ui/logo"

interface AuthPanelProps {
  children: React.ReactNode
}

export function AuthPanel({ children }: AuthPanelProps) {
  return (
    <div className="min-h-screen bg-muted/30 p-2">
      <div className="h-[calc(100vh-1rem)] grid lg:grid-cols-2 gap-2">
        {/* Left Panel - Branding */}
        <div className="rounded-2xl p-12 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          >
            <source src="/AuthBGLoop.mp4" type="video/mp4" />
            {/* Fallback to image if video doesn't load */}
            Your browser does not support the video tag.
          </video>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50 rounded-2xl" />
          
          <div className="relative z-10">
            {/* Logo at top */}
            <Logo
              variant="md"
              href="/"
              showIcon={false}
              textClassName="text-white"
            />
            {/* Founders and Company */}
            <div className="mt-3 text-white/60">
              <p className="text-sm">Kyle Richless & Peter Enestrom</p>
              <p className="text-sm">a Zaigo Labs Company</p>
            </div>
          </div>
          
          <div className="relative z-10">
            {/* Heading at bottom */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Gurley. Gerstner. Meeker.
              <br />
              Druckenmiller. Kindig.
              <br />
              Their Frameworks. Your Edge.
            </h1>
          </div>
        </div>

        {/* Right Panel - Auth Forms */}
        <div className="bg-card rounded-2xl p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {children}

            {/* Disclaimer */}
            <div className="mt-6 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong>Disclaimer:</strong> This is not investment advice. Stock market
                conditions are subject to change. Investors should perform their own due
                diligence and consider their individual financial goals and risk tolerance
                before making any investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
