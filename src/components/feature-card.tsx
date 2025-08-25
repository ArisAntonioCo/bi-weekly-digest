import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Avvvatars from 'avvvatars-react'

interface FeatureCardProps {
  title: string
  subtitle?: string
  bottomContent?: ReactNode
  className?: string
  showShape?: boolean
  shapeValue?: string
}

export function FeatureCard({ title, subtitle, bottomContent, className, showShape = false, shapeValue = "shape-78" }: FeatureCardProps) {
  return (
    <div className={cn(
      "bg-muted/50 rounded-3xl h-[400px] sm:h-[450px] lg:h-[500px] flex flex-col justify-between overflow-hidden p-8 sm:p-10 relative group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:bg-muted/70 cursor-pointer",
      className
    )}>
      <div className="flex items-start justify-between">
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          {title}
        </h3>
        {showShape && (
          <div 
            className="inline-block transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110"
          >
            <Avvvatars 
              value={shapeValue}
              style="shape"
              size={48}
            />
          </div>
        )}
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