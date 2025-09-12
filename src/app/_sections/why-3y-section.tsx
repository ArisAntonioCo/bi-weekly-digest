"use client"
import { ExpertAvatarStack } from '@/components/ui/expert-avatar-stack'
import { SectionStrip } from '@/components/ui/section-strip'

type CTA = { label: string; href: string }

interface Why3YSectionProps {
  ctaPrimary?: CTA
  ctaSecondary?: CTA
  className?: string
}

export function Why3YSection({
  ctaPrimary = { label: 'Analyze a ticker', href: '/expert-analysis' },
  ctaSecondary = { label: 'See a sample', href: '/blogs' },
  className,
}: Why3YSectionProps) {
  return (
    <section className={`container mx-auto px-4 sm:px-6 py-16 sm:py-24 ${className ?? ''}`}>
      {/* Headline */}
      <div className="max-w-6xl">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.06] tracking-tight text-foreground">
          A clear, analytical view of your portfolio
          <span className="text-muted-foreground">, through expert frameworks.</span>
          <ExpertAvatarStack size={44} className="ml-3 align-middle -translate-y-[2px]" />
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
          text="Personalize your lens stack to your investing style. Analyze any ticker with 3‑year MOIC bands (bear / base / bull). Compare, save, and refine."
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
