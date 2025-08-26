'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
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
  const wordEnd = (globalIndex + 1) / totalWords
  
  const y = useTransform(
    scrollYProgress,
    [wordStart * 0.8, wordEnd * 0.8 + 0.05],
    [40, 0],
    { clamp: true }
  )
  
  const opacity = useTransform(
    scrollYProgress,
    [wordStart * 0.8, wordEnd * 0.8 + 0.05],
    [0, 1],
    { clamp: true }
  )
  
  return (
    <motion.span
      className="inline-block mr-[0.25em] text-white"
      style={{ 
        y, 
        opacity,
        willChange: 'transform, opacity'
      }}
    >
      {word}
    </motion.span>
  )
}

export function FrameworksSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  // Fetch experts data
  const { experts, isLoading } = useExperts({ limit: 20 })

  // Calculate container height based on content
  useEffect(() => {
    const totalWords = 24 // Approximate total word count
    const scrollMultiplier = 100 // pixels of scroll per word
    setContainerHeight(totalWords * scrollMultiplier)
  }, [])

  // Text content split by lines - complete sentences
  const lines = [
    'Leveraging Proven Expert Frameworks',
    'Five expert lenses reveal what one voice misses.',
    'World-class investment frameworks expose blind spots,',
    'building conviction anchored in durable truth.'
  ]

  // Create word data with global indices for animation
  const allWords: { word: string; lineIndex: number; wordIndex: number; globalIndex: number }[] = []
  let globalIndex = 0
  
  lines.forEach((line, lineIndex) => {
    const words = line.split(' ')
    words.forEach((word, wordIndex) => {
      allWords.push({
        word,
        lineIndex,
        wordIndex,
        globalIndex: globalIndex++
      })
    })
  })

  const totalWords = allWords.length

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
      <div className="sticky top-0 w-full bg-black min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-32 w-full">
          <div className="w-full">
            {lines.map((line, lineIndex) => {
              const words = line.split(' ')
              
              return (
                <div key={lineIndex} className="overflow-hidden">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight whitespace-nowrap">
                    {words.map((word, wordIndex) => {
                      // Find the global index for this word
                      const wordData = allWords.find(
                        w => w.lineIndex === lineIndex && w.wordIndex === wordIndex
                      )
                      
                      if (!wordData) return null
                      
                      return (
                        <AnimatedWord
                          key={`${lineIndex}-${wordIndex}`}
                          word={word}
                          globalIndex={wordData.globalIndex}
                          totalWords={totalWords}
                          scrollYProgress={scrollYProgress}
                        />
                      )
                    })}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Expert Marquee */}
          {!isLoading && experts.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  )
}