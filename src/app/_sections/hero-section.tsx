import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedNewsletterList } from '@/components/animated-newsletter-list'


export function HeroSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Main Content */}
      <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-none">
            Predictive Finance
            <br />
            In Your Inbox
          </h1>
        </div>

        {/* CTA Section with Subheading */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Get Weekly Insights</h3>
              <p className="text-sm text-foreground">In Your Inbox</p>
            </div>
            <Link href="/signup">
              <Button variant="brand-cta" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                Get Started
              </Button>
            </Link>
          </div>
          
          <p className="text-base sm:text-lg font-semibold text-foreground max-w-full lg:max-w-md">
            AI-powered MOIC projections and
            <br className="hidden sm:block" />
            market insights in your inbox.
          </p>
        </div>

        {/* Hero Images Container */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Hero Video */}
          <div className="bg-black rounded-3xl h-[300px] sm:h-[400px] lg:h-[500px] flex-1 overflow-hidden relative">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/HeroVideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Square Newsletter Updates Card */}
          <div className="bg-foreground rounded-3xl w-full lg:w-[500px] h-[400px] sm:h-[450px] lg:h-[500px] flex flex-col overflow-hidden">
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-background leading-tight">Weekly 3Y MOIC<br />Predictions Delivered</h3>
            </div>
            
            <div className="flex-1 relative px-6 sm:px-8 pb-6 sm:pb-8">
              <AnimatedNewsletterList />
            </div>
          </div>
      </div>
    </section>
  )
}