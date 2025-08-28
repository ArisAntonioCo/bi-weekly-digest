import { cn } from '@/lib/utils'

interface LoadingCardProps {
  lines?: number
  showImage?: boolean
  className?: string
}

export function LoadingCard({ 
  lines = 3, 
  showImage = false,
  className 
}: LoadingCardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-border bg-card/50 p-6 space-y-4',
      className
    )}>
      {showImage && (
        <div className="h-48 w-full bg-muted rounded-md animate-pulse" />
      )}
      
      <div className="space-y-3">
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
        
        <div className="space-y-2">
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 bg-muted rounded animate-pulse',
                i === lines - 1 ? 'w-2/3' : 'w-full'
              )}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

interface LoadingCardGridProps {
  count?: number
  columns?: 1 | 2 | 3 | 4
  showImage?: boolean
  className?: string
}

export function LoadingCardGrid({ 
  count = 6, 
  columns = 3,
  showImage = false,
  className 
}: LoadingCardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn(
      'grid gap-6',
      gridCols[columns],
      className
    )}>
      {Array.from({ length: count }, (_, i) => (
        <LoadingCard key={i} showImage={showImage} />
      ))}
    </div>
  )
}