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
      "bg-foreground rounded-3xl h-[400px] sm:h-[450px] lg:h-[500px] flex flex-col justify-between overflow-hidden p-8 sm:p-10",
      className
    )}>
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-background leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-base sm:text-lg text-background/70 mt-2">
            {subtitle}
          </p>
        )}
      </div>
      
      {bottomContent && (
        <div className="text-background/90">
          {bottomContent}
        </div>
      )}
    </div>
  )
}