import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-gradient-to-r from-muted to-secondary rounded-xl sm:rounded-2xl py-16 sm:py-20 lg:py-24 px-8 sm:px-12 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-none">
          Access Expert-Level 3Y MOIC Projections Today
        </h2>
        <p className="text-sm sm:text-base text-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-snug px-4">
          Get institutional-quality analysis using frameworks from Gurley, Gerstner, Druckenmiller, Meeker & Kindig.
        </p>
        <Link href="/signup">
          <Button variant="brand-cta" size="lg" className="w-full sm:w-auto">
            Subscribe Now
          </Button>
        </Link>
      </div>
    </section>
  )
}