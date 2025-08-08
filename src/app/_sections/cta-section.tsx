import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="bg-gradient-to-r from-muted to-secondary rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-none">
          Start Your Investment Journey Today
        </h2>
        <p className="text-sm sm:text-base text-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-snug px-4">
          Join thousands of investors who trust our AI-powered platform for market insights and investment strategies.
        </p>
        <Link href="/signup">
          <Button variant="brand-cta" size="lg" className="w-full sm:w-auto">
            Get Started for Free
          </Button>
        </Link>
      </div>
    </section>
  )
}