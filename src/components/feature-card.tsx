import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  title: string
  subtitle?: string
  bottomContent?: ReactNode
  className?: string
}

export function FeatureCard({ title, subtitle, bottomContent, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "bg-muted rounded-3xl h-[400px] sm:h-[450px] lg:h-[500px] flex flex-col justify-between overflow-hidden p-8 sm:p-10",
      className
    )}>
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          {title}
        </h3>
      </div>
      
      <div>
        {subtitle && (
          <p className="text-base sm:text-lg text-muted-foreground">
            {subtitle}
          </p>
        )}
        {bottomContent && (
          <div className="text-foreground mt-4">
            {bottomContent}
          </div>
        )}
      </div>
    </div>
  )
}