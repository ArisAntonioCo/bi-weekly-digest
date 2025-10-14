'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, MotionValue, useInView } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useExperts } from '@/hooks/use-experts'
import { ExpertMarqueeCard } from './expert-marquee-card'

interface AnimatedWordProps {
  word: string
  globalIndex: number
  totalWords: number
  scrollYProgress: MotionValue<number>
}

function AnimatedWord({ word, globalIndex, totalWords, scrollYProgress }: AnimatedWordProps) {
  const wordStart = globalIndex / totalWords
  
  // Instant transition from muted to highlighted
  const opacity = useTransform(
    scrollYProgress,
    [wordStart * 0.8, wordStart * 0.8 + 0.001],
    [0.3, 1], // Instant jump from 30% to 100%
    { clamp: true }
  )
  
  // Instant color change from gray to white
  const color = useTransform(
    scrollYProgress,
    [wordStart * 0.8, wordStart * 0.8 + 0.001],
    ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 1)'],
    { clamp: true }
  )
  
  return (
    <motion.span
      className="inline-block mr-[0.3em]"
      style={{ 
        opacity,
        color,
        willChange: 'opacity, color'
      }}
    >
      {word}
    </motion.span>
  )
}

export function FrameworksSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)
  const isInView = useInView(containerRef, { once: true, margin: '-25% 0px' })
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  // Scroll indicator visibility (fade out as user begins to scroll)
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0], { clamp: true })

  // Fetch experts data
  const { experts, isLoading } = useExperts({ limit: 12, enabled: isInView })

  // Text content as one continuous flow
  const fullText = 'Combining Battle-Tested Expert Frameworks help to Reveal What a Single Voice Might Miss. World-Class Investment Strategies, Taken in Combination, Often Expose Blind Spots, Build Conviction, and Provide the Most Precise Forward-Looking Estimate of Stock Returns.'
  
  // Split into individual words for animation
  const words = fullText.split(' ')

  const totalWords = words.length

  // Calculate container height based on content
  useEffect(() => {
    const scrollMultiplier = 100 // pixels of scroll per word
    setContainerHeight(totalWords * scrollMultiplier)
  }, [totalWords])

  // Split experts into two lines for marquee
  const halfIndex = Math.ceil(experts.length / 2)
  const expertsLine1 = experts.slice(0, halfIndex)
  const expertsLine2 = experts.slice(halfIndex)

  // Duplicate for infinite scroll effect
  const marqueeExperts1 = [...expertsLine1, ...expertsLine1]
  const marqueeExperts2 = [...expertsLine2, ...expertsLine2]

  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{ height: `${containerHeight}px` }}
    >
      {/* Sticky content container */}
      <div className="sticky top-0 w-full bg-black min-h-screen flex items-center relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-32 w-full">
          <div className="w-full">
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-tight">
              {words.map((word, index) => {
                return (
                  <AnimatedWord
                    key={index}
                    word={word}
                    globalIndex={index}
                    totalWords={totalWords}
                    scrollYProgress={scrollYProgress}
                  />
                )
              })}
            </p>
          </div>

          {/* Expert Marquee */}
          {isInView && !isLoading && experts.length > 0 ? (
            <div className="mt-16 overflow-hidden relative">
              <div className="space-y-4">
                {/* First marquee line */}
                <div className="relative flex overflow-hidden">
                  <motion.div 
                    className="flex gap-4 whitespace-nowrap"
                    animate={{ 
                      x: ['0%', '-50%']
                    }}
                    transition={{
                      x: {
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop"
                      }
                    }}
                  >
                    {marqueeExperts1.map((expert, index) => (
                      <ExpertMarqueeCard 
                        key={`line1-${index}`}
                        expert={expert}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Gradient overlays for first line */}
                  <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
                </div>

                {/* Second marquee line */}
                <div className="relative flex overflow-hidden">
                  <motion.div 
                    className="flex gap-4 whitespace-nowrap"
                    animate={{ 
                      x: ['-50%', '0%']
                    }}
                    transition={{
                      x: {
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop"
                      }
                    }}
                  >
                    {marqueeExperts2.map((expert, index) => (
                      <ExpertMarqueeCard 
                        key={`line2-${index}`}
                        expert={expert}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Gradient overlays for second line */}
                  <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-16 h-[240px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
          )}
        </div>

        {/* Scroll indicator (top-left, text + bouncing chevron, fades out on scroll) */}
        <motion.div
          aria-hidden
          style={{ opacity: indicatorOpacity }}
          className="absolute top-6 left-6 text-white pointer-events-none select-none z-50"
        >
          <div className="flex items-center gap-2 text-sm sm:text-base text-white/90">
            <span>Scroll to explore</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
