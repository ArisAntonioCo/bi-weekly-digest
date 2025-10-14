import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type CTA = { label: string; href: string; variant?: 'default' | 'brand-cta' | 'secondary' | 'outline'; size?: 'sm' | 'default' | 'lg'; className?: string }

interface SectionStripProps {
  label: string
  text: string | React.ReactNode
  ctas?: CTA[]
  className?: string
  ctaAlign?: 'start' | 'end'
}

// A reusable 12-column strip with a left label, middle copy, and right-aligned CTAs.
export function SectionStrip({ label, text, ctas = [], className, ctaAlign = 'end' }: SectionStripProps) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-12 gap-10 items-start', className)}>
      <div className="lg:col-span-3">
        <p className="text-sm font-semibold tracking-[0.22em] uppercase text-muted-foreground">{label}</p>
      </div>
      <div className="lg:col-span-5">
        <p className="text-base sm:text-lg leading-7 text-foreground/80 max-w-prose">{text}</p>
      </div>
      <div className={cn('lg:col-span-4 flex', ctaAlign === 'end' ? 'lg:justify-end' : 'lg:justify-start')}>
        {ctas.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {ctas.map((cta, i) => {
              const variant: 'default' | 'brand-cta' | 'secondary' | 'outline' = cta.variant ?? 'default'
              const size: 'sm' | 'default' | 'lg' = cta.size ?? 'lg'
              const buttonClasses = cn(
                'rounded-full',
                !cta.size && 'text-base sm:text-lg font-semibold !h-14 !px-10',
                cta.className
              )

              return (
                <Link key={`${cta.label}-${i}`} href={cta.href} className="w-full sm:w-auto">
                  <Button variant={variant} size={size} className={buttonClasses}>
                    {cta.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
