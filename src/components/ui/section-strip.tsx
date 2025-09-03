import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type CTA = { label: string; href: string; variant?: 'default' | 'brand-cta' | 'secondary' | 'outline'; size?: 'sm' | 'default' | 'lg' }

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
        <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground">{label}</p>
      </div>
      <div className="lg:col-span-5">
        <p className="text-sm sm:text-base text-foreground/80 max-w-prose">{text}</p>
      </div>
      <div className={cn('lg:col-span-4 flex', ctaAlign === 'end' ? 'lg:justify-end' : 'lg:justify-start')}>
        {ctas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ctas.map((cta, i) => (
              <Link key={`${cta.label}-${i}`} href={cta.href}>
                <Button 
                  variant={(cta.variant as any) ?? 'default'} 
                  size={(cta.size as any) ?? 'default'}
                  className="rounded-full"
                >
                  {cta.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
