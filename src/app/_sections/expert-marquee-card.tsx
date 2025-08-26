import Image from 'next/image'
import { Expert } from '@/types/expert'

interface ExpertMarqueeCardProps {
  expert: Expert
}

export function ExpertMarqueeCard({ expert }: ExpertMarqueeCardProps) {
  const getAvatarUrl = () => {
    if (!expert.avatar_seed) {
      // Generate a seed from the name if not provided
      const seed = expert.name.toLowerCase().replace(/\s+/g, '-')
      const colors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
      const colorIndex = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
      return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=${colors[colorIndex]}`
    }
    
    const colors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
    const colorIndex = expert.avatar_seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${expert.avatar_seed}&backgroundColor=${colors[colorIndex]}`
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
      <Image
        src={getAvatarUrl()}
        alt={`${expert.name} avatar`}
        width={36}
        height={36}
        className="rounded-full flex-shrink-0"
        unoptimized
      />
      <div className="flex flex-col min-w-0">
        <span className="text-white text-sm font-medium truncate">
          {expert.name}
        </span>
        {expert.title && (
          <span className="text-white/60 text-xs truncate">
            {expert.title}
          </span>
        )}
      </div>
    </div>
  )
}