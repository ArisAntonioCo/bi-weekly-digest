import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DISCLAIMER_HEADING, DISCLAIMER_PARAGRAPHS } from '@/config/disclaimer'

export function AnalyticsSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-12 sm:mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-none max-w-5xl">
          See How World-Class Investors
          <br />
          Forecast Any Public Equity&apos;s
          <br />
          3-Year Return Potential
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
              Druckenmiller & more for precise
              <br />
              stock return forecasts and durability analysis.
            </p>
          </div>
          
          {/* Screenshot - Single image anchored bottom-right (no overflow) */}
          <div className="hidden lg:block absolute right-12 bottom-0">
            <Image
              src="/feat-1.png"
              alt="Expert Stock Analysis screenshot"
              width={760}
              height={400}
              className="rounded-xl shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-6 text-xs text-muted-foreground leading-relaxed max-w-3xl">
        <p className="font-semibold uppercase tracking-wide text-foreground/80 mb-2">
          {DISCLAIMER_HEADING}
        </p>
        {DISCLAIMER_PARAGRAPHS.map(paragraph => (
          <p key={paragraph} className="mb-2 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
