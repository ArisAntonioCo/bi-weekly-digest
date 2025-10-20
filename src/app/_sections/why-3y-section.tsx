'use client'

import { motion } from 'motion/react'
import { Target, Layers, LineChart } from 'lucide-react'
import { ExpertAvatarStack } from '@/components/ui/expert-avatar-stack'
import { cn } from '@/lib/utils'

const reasons = [
  {
    icon: Target,
    headline: 'Why 3Y Mode',
    subheading: 'Expert lenses, stacked for clarity—not noise.',
    description:
      'Three-year horizons surface compounding, pricing power, and durability so you can act with conviction.',
  },
  {
    icon: Layers,
    headline: 'What you can do',
    subheading: 'Personalize your lens stack to match how you invest.',
    description:
      'Analyze any ticker with bear / base / bull projections, compare scenarios, and save the perspectives that matter.',
  },
  {
    icon: LineChart,
    headline: 'Why three years',
    subheading: 'Focus on the horizon where signal beats noise.',
    description:
      'Product cycles, capital efficiency, and reinvestment show up over multi-year arcs—exactly where we orient everything.',
  },
]

export interface Why3YSectionProps {
  className?: string
}

export function Why3YSection({ className }: Why3YSectionProps) {
  return (
    <section className={cn('container mx-auto px-4 sm:px-6 py-16 sm:py-24', className)}>
      <header className="max-w-6xl space-y-4">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.06] tracking-tight text-foreground flex flex-wrap items-center gap-4">
          <span>A clear, analytical view of your portfolio</span>
          <span className="text-muted-foreground">, through expert frameworks.</span>
          <ExpertAvatarStack size={56} className="hidden md:inline-flex -translate-y-1" />
        </h2>
      </header>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {reasons.map((reason, index) => {
          const Icon = reason.icon
          return (
            <motion.div
              key={reason.headline}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.24, 0.72, 0.17, 1], delay: index * 0.08 }}
              viewport={{ once: true, amount: 0.3 }}
              className={cn(
                'flex flex-col gap-6 border-t border-border/40 pt-10 lg:border-t-0 lg:pt-0',
                index > 0 && 'lg:border-l lg:pl-12 lg:border-border/40'
              )}
            >
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground leading-snug">{reason.headline}</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{reason.subheading}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
