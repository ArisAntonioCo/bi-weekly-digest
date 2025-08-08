import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="bg-gradient-to-r from-muted to-secondary rounded-2xl p-12 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-none">
          Start Your Investment Journey Today
        </h2>
        <p className="text-foreground mb-8 max-w-2xl mx-auto leading-snug">
          Join thousands of investors who trust our AI-powered platform for market insights and investment strategies.
        </p>
        <Link href="/signup">
          <Button variant="brand-cta" size="lg">
            Get Started for Free
          </Button>
        </Link>
      </div>
    </section>
  )
}