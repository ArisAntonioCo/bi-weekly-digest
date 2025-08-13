import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function AnalyticsSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-12 sm:mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-none max-w-5xl">
          See What World-Class Investors
          <br />
          Would Think About Any Stock&apos;s
          <br />
          3-Year Potential
        </h2>
        <Link href="/signup">
          <Button variant="brand-cta" size="lg" className="w-full sm:w-auto">
            Subscribe Now
          </Button>
        </Link>
      </div>

      <div className="bg-foreground rounded-3xl p-8 sm:p-12 lg:p-16 min-h-[500px] relative overflow-hidden">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <p className="text-lg sm:text-xl font-medium text-background">
              Expert frameworks from Gurley, Gerstner,
              <br />
              Druckenmiller & more for precise MOIC
              <br />
              projections and durability analysis.
            </p>
          </div>
          
          {/* Screenshots - Dashboard overlapping AI Chat */}
          <div className="hidden lg:block absolute right-12 bottom-0">
            <div className="relative">
              {/* AI Chat Screenshot (back layer) */}
              <Image
                src="/ai-chat-sc.png"
                alt="AI Financial Assistant Interface"
                width={800}
                height={900}
                className="rounded-t-xl shadow-2xl"
                priority
              />
              
              {/* Dashboard Screenshot (front layer, overlapping from left) */}
              <div className="absolute -left-96 top-20">
                <Image
                  src="/dashboard-sc.png"
                  alt="Dashboard Interface"
                  width={700}
                  height={800}
                  className="rounded-xl shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
        All financial projections and analysis are generated using proprietary machine learning models trained on historical market data. 
        Past performance is not indicative of future results. This is not personalized investment advice. 
        Please consult with qualified financial advisors before making investment decisions.
      </p>
    </section>
  )
}