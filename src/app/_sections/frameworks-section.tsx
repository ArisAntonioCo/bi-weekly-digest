'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function FrameworksSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  // Calculate container height based on content
  useEffect(() => {
    const totalWords = 24 // Approximate total word count
    const scrollMultiplier = 100 // pixels of scroll per word
    setContainerHeight(totalWords * scrollMultiplier)
  }, [])

  // Text content split by lines - improved line breaks
  const lines = [
    'Leveraging Proven, Expert Frameworks',
    'Five expert lenses reveal what one voice misses.',
    'By combining world-class investment',
    'frameworks, we expose blind spots and',
    'build conviction anchored in durable truth.'
  ]

  // Create word data with global indices
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

  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{ height: `${containerHeight}px` }}
    >
      {/* Sticky content container */}
      <div className="sticky top-0 w-full bg-black min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-32">
          <div className="max-w-4xl">
            {lines.map((line, lineIndex) => {
              const words = line.split(' ')
              
              return (
                <div key={lineIndex} className="overflow-hidden">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight whitespace-nowrap md:whitespace-normal">
                    {words.map((word, wordIndex) => {
                      // Find the global index for this word
                      const wordData = allWords.find(
                        w => w.lineIndex === lineIndex && w.wordIndex === wordIndex
                      )
                      
                      if (!wordData) return null
                      
                      // Calculate progress range for smooth reveal
                      const wordStart = wordData.globalIndex / totalWords
                      const wordEnd = (wordData.globalIndex + 1) / totalWords
                      
                      // Smoother transform with easing
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
                          key={`${lineIndex}-${wordIndex}`}
                          className="inline-block mr-[0.25em]"
                          style={{ 
                            y, 
                            opacity,
                            willChange: 'transform, opacity'
                          }}
                        >
                          {word}
                        </motion.span>
                      )
                    })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}