"use client"

import { useState } from 'react'
import Image from 'next/image'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown, User } from 'lucide-react'

interface AvatarSelectorProps {
  value?: string
  onChange: (seed: string) => void
  placeholder?: string
}

// Generate 30 different seed options for personas avatars
const AVATAR_SEEDS = Array.from({ length: 30 }, (_, i) => `expert-${i + 1}`)

export function AvatarSelector({ 
  value, 
  onChange, 
  placeholder = "Select an avatar" 
}: AvatarSelectorProps) {
  const [open, setOpen] = useState(false)

  const getAvatarUrl = (seed: string) => {
    // Generate a consistent background color based on the seed
    const colors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
    const colorIndex = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=${colors[colorIndex]}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-2"
        >
          <div className="flex items-center gap-3">
            {value ? (
              <>
                <Image
                  src={getAvatarUrl(value)}
                  alt="Selected avatar"
                  width={40}
                  height={40}
                  className="rounded-full bg-muted"
                  unoptimized
                />
                <span className="text-sm">Avatar selected</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{placeholder}</span>
              </>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-3" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium">Choose an avatar</div>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_SEEDS.map((seed) => (
              <button
                key={seed}
                onClick={() => {
                  onChange(seed)
                  setOpen(false)
                }}
                className={cn(
                  "group relative rounded-lg p-1 hover:bg-muted transition-colors overflow-visible",
                  value === seed && "bg-muted ring-2 ring-primary"
                )}
              >
                <Image
                  src={getAvatarUrl(seed)}
                  alt={`Avatar ${seed}`}
                  width={48}
                  height={48}
                  className="rounded-full bg-background"
                  unoptimized
                />
                {value === seed && (
                  <div className="absolute inset-1 flex items-center justify-center rounded-lg bg-primary/10 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear selection
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}