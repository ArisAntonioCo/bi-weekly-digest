import Image from 'next/image'
import { useMemo } from 'react'
import { Expert } from '@/types/expert'

interface ExpertMarqueeCardProps {
  expert: Expert
}

export function ExpertMarqueeCard({ expert }: ExpertMarqueeCardProps) {
  const avatarUrl = useMemo(() => {
    const palette = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']

    const getSeed = () => {
      if (expert.avatar_seed) {
        return expert.avatar_seed
      }
      return expert.name.toLowerCase().replace(/\s+/g, '-')
    }

    const seed = getSeed()
    const colorIndex = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length

    return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=${palette[colorIndex]}`
  }, [expert.avatar_seed, expert.name])

  return (
    <div className="flex items-center gap-5 px-8 py-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
      <Image
        src={avatarUrl}
        alt={`${expert.name} avatar`}
        width={64}
        height={64}
        className="rounded-full flex-shrink-0"
        unoptimized
      />
      <div className="flex flex-col min-w-0">
        <span className="text-white text-lg font-semibold truncate">
          {expert.name}
        </span>
        {expert.title && (
          <span className="text-white/70 text-base truncate">
            {expert.title}
          </span>
        )}
      </div>
    </div>
  )
}
