import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ExpertAvatarStackProps {
  values?: string[]
  size?: number
  className?: string
  overlap?: boolean
}

// Inline stack of expert-style avatars using DiceBear (notionists)
export function ExpertAvatarStack({
  values = ['gurley', 'gerstner', 'druckenmiller', 'meeker'],
  size = 28,
  className,
  overlap = true,
}: ExpertAvatarStackProps) {
  const colors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
  const urlFor = (seed: string) => {
    const s = (seed || 'expert').toLowerCase().replace(/\s+/g, '-')
    const idx = s.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % colors.length
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${s}&backgroundColor=${colors[idx]}`
  }
  return (
    <span className={cn('inline-flex items-center align-middle', overlap && (size >= 36 ? '-space-x-3' : '-space-x-2'), className)}>
      {values.map((v) => (
        <span
          key={v}
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-background border border-white overflow-hidden'
          )}
          style={{ width: size, height: size }}
          aria-hidden
        >
          <Image src={urlFor(v)} alt="expert avatar" width={size - 4} height={size - 4} className="rounded-full" unoptimized />
        </span>
      ))}
    </span>
  )
}
