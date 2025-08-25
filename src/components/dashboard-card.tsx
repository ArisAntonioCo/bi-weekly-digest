import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'highlight' | 'compact'
  clickable?: boolean
  onClick?: () => void
  padding?: 'none' | 'small' | 'medium' | 'large'
}

export function DashboardCard({ 
  children, 
  className,
  variant = 'default',
  clickable = false,
  onClick,
  padding = 'medium'
}: DashboardCardProps) {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-5',
    medium: 'p-6',
    large: 'p-8'
  }

  const variantClasses = {
    default: 'bg-muted/50 min-h-[200px]',
    highlight: 'bg-muted/50 min-h-[300px]',
    compact: 'bg-muted/50'
  }

  const baseClasses = cn(
    'rounded-3xl transition-all duration-200',
    paddingClasses[padding],
    variantClasses[variant],
    clickable && 'cursor-pointer hover:bg-muted/70 active:bg-muted/50',
    className
  )

  if (clickable && onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(baseClasses, 'w-full text-left focus:outline-none focus:ring-2 focus:ring-muted-foreground/20')}
      >
        {children}
      </button>
    )
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className={cn(
              "font-semibold text-foreground leading-tight",
              icon ? "text-base" : "text-lg"
            )}>{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('mt-4', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border/50', className)}>
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number | ReactNode
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, change, icon, className }: StatCardProps) {
  return (
    <DashboardCard variant="compact" padding="medium" className={className}>
      <div className="flex flex-col justify-between h-full">
        <div className="mb-6">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              <span className={cn(
                'text-xs font-medium',
                change.type === 'increase' && 'text-green-600',
                change.type === 'decrease' && 'text-red-600',
                change.type === 'neutral' && 'text-muted-foreground'
              )}>
                {change.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  )
}