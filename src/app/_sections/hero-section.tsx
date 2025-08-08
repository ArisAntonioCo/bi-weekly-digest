import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedNewsletterList } from '@/components/animated-newsletter-list'


export function HeroSection() {
  return (
    <section className="container mx-auto px-6 py-20">
      {/* Main Content */}
      <div className="mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-none">
            Predictive Finance
            <br />
            In Your Inbox
          </h1>
        </div>

        {/* CTA Section with Subheading */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Get Weekly Insights</h3>
              <p className="text-sm text-foreground">In Your Inbox</p>
            </div>
            <Link href="/signup">
              <Button variant="brand-cta" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
          
          <p className="text-lg font-semibold text-foreground max-w-md">
            AI-powered MOIC projections and
            <br />
            market insights in your inbox.
          </p>
        </div>

        {/* Hero Images Container */}
        <div className="flex gap-2">
          {/* Main Hero Image */}
          <div className="bg-muted rounded-2xl h-[500px] flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Hero Image Coming Soon</p>
          </div>
          
          {/* Square Newsletter Updates Card */}
          <div className="bg-foreground rounded-2xl w-[500px] h-[500px] flex flex-col overflow-hidden">
            <div className="px-8 pt-8 pb-4">
              <h3 className="text-2xl font-bold text-background leading-tight">Weekly 3Y MOIC<br />Predictions Delivered</h3>
            </div>
            
            <div className="flex-1 relative px-8 pb-8">
              <AnimatedNewsletterList />
            </div>
          </div>
      </div>
    </section>
  )
}