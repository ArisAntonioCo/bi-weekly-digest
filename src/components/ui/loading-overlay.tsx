import { LoadingSpinner } from './loading-spinner'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  message?: string
  className?: string
  fullScreen?: boolean
}

export function LoadingOverlay({ 
  message = 'Loading...', 
  className,
  fullScreen = true 
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}