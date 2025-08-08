import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function BlogPreviewSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-none">
          Latest Investment Insights
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 leading-snug px-4">
          Explore our AI-powered analysis and stay ahead of market trends with comprehensive investment research.
        </p>
        <Link href="/blogs">
          <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted w-full sm:w-auto">
            View All Insights
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}