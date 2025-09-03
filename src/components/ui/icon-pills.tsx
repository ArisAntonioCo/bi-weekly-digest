import { CalendarDays, Coins, DollarSign, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface IconPillsProps {
  size?: number
  icons?: ReactNode[]
  className?: string
  overlap?: boolean
}

// Small inline row of circular icon pills for decorative emphasis in headings.
export function IconPills({
  size = 28,
  icons,
  className,
  overlap = true,
}: IconPillsProps) {
  const defaultIcons = [
    <CalendarDays key="cal" className="w-[60%] h-[60%]" />,
    <Coins key="coins" className="w-[60%] h-[60%]" />,
    <DollarSign key="usd" className="w-[60%] h-[60%]" />,
    <Star key="star" className="w-[60%] h-[60%]" />,
  ]

  const items = icons && icons.length > 0 ? icons : defaultIcons

  return (
    <span className={cn('inline-flex items-center', overlap && '-space-x-2', className)}>
      {items.map((icon, i) => (
        <span
          key={i}
          className="inline-flex items-center justify-center rounded-full bg-foreground text-background shadow-sm"
          style={{ width: size, height: size }}
          aria-hidden
        >
          {icon}
        </span>
      ))}
    </span>
  )
}

