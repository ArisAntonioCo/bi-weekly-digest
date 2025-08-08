import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function BlogPreviewSection() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-none">
          Latest Investment Insights
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8 leading-snug">
          Explore our AI-powered analysis and stay ahead of market trends with comprehensive investment research.
        </p>
        <Link href="/blogs">
          <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
            View All Insights
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}