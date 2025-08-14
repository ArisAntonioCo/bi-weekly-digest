import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'sm' | 'md' | 'lg'
  href?: string
  showIcon?: boolean
  showText?: boolean
  className?: string
  iconClassName?: string
  textClassName?: string
}

const sizeConfig = {
  sm: {
    icon: 'size-6',
    iconWrapper: 'size-8',
    text: 'text-lg',
    gap: 'gap-1.5',
    svgHeight: 18,
  },
  md: {
    icon: 'size-6',
    iconWrapper: 'size-10',
    text: 'text-2xl',
    gap: 'gap-2',
    svgHeight: 24,
  },
  lg: {
    icon: 'size-8',
    iconWrapper: 'size-12',
    text: 'text-3xl',
    gap: 'gap-3',
    svgHeight: 32,
  },
}

export function Logo({
  variant = 'md',
  href = '/',
  showIcon = true,
  showText = true,
  className,
  iconClassName,
  textClassName,
}: LogoProps) {
  const config = sizeConfig[variant]

  const logoContent = (
    <>
      {showIcon && (
        <div
          className={cn(
            'bg-white text-black flex items-center justify-center rounded-md',
            config.iconWrapper,
            iconClassName
          )}
        >
          <TrendingUp className={config.icon} />
        </div>
      )}
      {showText && (
        <div className={cn('flex items-center', config.gap)}>
          <div 
            className="relative [&_img]:brightness-0 [&_img]:dark:invert [&_img]:dark:brightness-100" 
            style={{ 
              height: config.svgHeight,
              filter: textClassName?.includes('text-white') || textClassName?.includes('text-gray-100') || textClassName?.includes('text-slate-100') 
                ? 'invert(1) brightness(100%)' 
                : undefined
            }}
          >
            <Image
              src="/3YMode.svg"
              alt="3YMode"
              width={config.svgHeight * (600/325)}
              height={config.svgHeight}
            />
          </div>
          <span
            className={cn(
              'font-semibold',
              config.text,
              textClassName
            )}
          >
            3YMode
          </span>
        </div>
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          'flex items-center transition-opacity hover:opacity-80',
          config.gap,
          className
        )}
      >
        {logoContent}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center',
        config.gap,
        className
      )}
    >
      {logoContent}
    </div>
  )
}