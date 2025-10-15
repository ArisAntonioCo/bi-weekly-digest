"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState, useRef, useEffect } from 'react'

export function CTASection() {
  const [hoveredCard, setHoveredCard] = useState<'left' | 'right' | null>(null)
  const leftVideoRef = useRef<HTMLVideoElement>(null)
  const rightVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Play/pause videos based on hover state
    if (hoveredCard === 'left' && leftVideoRef.current) {
      leftVideoRef.current.play()
    } else if (leftVideoRef.current) {
      leftVideoRef.current.pause()
      leftVideoRef.current.currentTime = 0
    }

    if (hoveredCard === 'right' && rightVideoRef.current) {
      rightVideoRef.current.play()
    } else if (rightVideoRef.current) {
      rightVideoRef.current.pause()
      rightVideoRef.current.currentTime = 0
    }
  }, [hoveredCard])

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Card - Free account emphasis */}
        <div 
          className="relative bg-muted overflow-hidden group cursor-pointer h-[400px] lg:h-[500px]"
          onMouseEnter={() => setHoveredCard('left')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Video Background (hidden initially) */}
          <video
            ref={leftVideoRef}
            src="/AuthBGLoop.mp4"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              hoveredCard === 'left' ? 'opacity-100' : 'opacity-0'
            }`}
            loop
            muted
            playsInline
          />
          
          {/* Dark overlay for video */}
          {hoveredCard === 'left' && (
            <div className="absolute inset-0 bg-black/40 z-[1]" />
          )}
          
          <div className="relative z-10 p-8 sm:p-12 h-full flex flex-col justify-between">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 transition-colors ${
                hoveredCard === 'left' ? 'text-white' : 'text-foreground'
              }`}>
                Start Getting Free Weekly
                <br />
                Stock Return Forecasts
              </h2>
              <p className={`text-base transition-colors ${
                hoveredCard === 'left' ? 'text-white/90' : 'text-foreground/80'
              }`}>
                Join thousands analyzing stocks with elite investor frameworks.
                <br />
                100% free and open-source—no credit card required.
              </p>
            </div>
            <Button 
              asChild
              variant="outline" 
              size="lg" 
              className={`border-0 transition-all rounded-full px-8 whitespace-nowrap self-start ${
                hoveredCard === 'left' 
                  ? 'bg-white/90 hover:bg-white text-black' 
                  : 'bg-white hover:bg-white/90 text-foreground'
              }`}
            >
              <Link href="/signup">Create Free Account →</Link>
            </Button>
          </div>
        </div>

        {/* Right Card - Open source contribution */}
        <div 
          className="relative bg-muted overflow-hidden group cursor-pointer h-[400px] lg:h-[500px]"
          onMouseEnter={() => setHoveredCard('right')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Video Background (hidden initially) */}
          <video
            ref={rightVideoRef}
            src="/AuthBGLoop.mp4"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              hoveredCard === 'right' ? 'opacity-100' : 'opacity-0'
            }`}
            loop
            muted
            playsInline
          />
          
          {/* Gradient overlay for video */}
          {hoveredCard === 'right' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-[1]" />
          )}
          
          <div className="relative z-10 p-8 sm:p-12 h-full flex flex-col justify-between">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-semibold mb-2 transition-colors ${
                hoveredCard === 'right' ? 'text-white' : 'text-foreground'
              }`}>
                Contribute to the
                <br />
                Open-Source Platform
              </h2>
              <p className={`text-base transition-colors ${
                hoveredCard === 'right' ? 'text-white/90' : 'text-foreground/80'
              }`}>
                Help shape 3YMode by improving research workflows,
                <br />
                fixing issues, and shipping new investment tools.
              </p>
            </div>
            <Button 
              asChild
              variant="default" 
              size="lg" 
              className={`border-0 transition-all rounded-full px-8 whitespace-nowrap self-start ${
                hoveredCard === 'right' 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-white hover:bg-white/90 text-foreground'
              }`}
            >
              <Link href="https://github.com/ArisAntonioCo/bi-weekly-digest" target="_blank" rel="noopener noreferrer">
                Contribute on GitHub →
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  )
}
