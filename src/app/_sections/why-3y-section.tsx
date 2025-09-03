"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ExpertAvatarStack } from '@/components/ui/expert-avatar-stack'
import { SectionStrip } from '@/components/ui/section-strip'

type CTA = { label: string; href: string }

interface Why3YSectionProps {
  headline?: string
  subhead?: string
  ctaPrimary?: CTA
  ctaSecondary?: CTA
  showTable?: boolean
  className?: string
}

export function Why3YSection({
  headline = 'Get results and',
  subhead = 'analysis, through expert frameworks — a clear, durable view.',
  ctaPrimary = { label: 'Analyze a ticker', href: '/expert-analysis' },
  ctaSecondary = { label: 'See a sample', href: '/blogs' },
  showTable = false,
  className,
}: Why3YSectionProps) {
  return (
    <section className={`container mx-auto px-4 sm:px-6 py-16 sm:py-24 ${className ?? ''}`}>
      {/* Headline */}
      <div className="max-w-6xl">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.06] tracking-tight text-foreground">
          <span className="text-muted-foreground">Get</span>{' '}
          <span>results</span>{' '}
          <span className="text-muted-foreground">and</span>
          <br />
          <span>analysis</span>
          <span className="text-muted-foreground">, through expert frameworks</span>
          <ExpertAvatarStack size={44} className="ml-3 align-middle -translate-y-[2px]" />
          <span className="text-muted-foreground"> — a clear, durable view.</span>
        </h2>
      </div>

      {/* Strips with big vertical gaps and CTAs */}
      <div className="mt-16 space-y-16 sm:space-y-20">
        <SectionStrip 
          label="Why 3Y Mode"
          text="Expert lenses, stacked for clarity—not noise. Three‑year horizons reveal compounding and pricing power, so you can move with conviction."
          ctas={[{ label: 'Learn more', href: ctaSecondary.href }]}
        />
        <SectionStrip 
          label="What You Can Do"
          text="Analyze any ticker through stacked expert frameworks. See 3‑year MOIC (bear / base / bull), compare, save, and refine."
          ctas={[{ label: 'Analyze a ticker', href: ctaPrimary.href }]}
        />
        <SectionStrip 
          label="Why 3‑Year Hold"
          text="Cuts noise and aligns with real product and capital cycles—making compounding and pricing power visible for more durable conviction."
          ctas={[{ label: 'Learn more', href: ctaSecondary.href }]}
        />
      </div>
    </section>
  )
}

// (helpers removed to keep the section minimal and focused)
