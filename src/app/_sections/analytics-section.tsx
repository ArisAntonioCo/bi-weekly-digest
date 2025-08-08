import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function AnalyticsSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-12 sm:mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-none max-w-5xl">
          World-class Financial Intelligence &
          <br />
          Analysis, leveraging Proprietary and
          <br />
          Cutting Edge ML Models
        </h2>
        <Link href="/signup">
          <Button variant="brand-cta" size="lg" className="w-full sm:w-auto">
            Get Started
          </Button>
        </Link>
      </div>

      <div className="bg-foreground rounded-3xl p-8 sm:p-12 lg:p-16 min-h-[500px]">
        <p className="text-lg sm:text-xl font-medium text-background">
          Institutional-grade analytical tools
          <br />
          powered by advanced ML models.
        </p>
      </div>
    </section>
  )
}