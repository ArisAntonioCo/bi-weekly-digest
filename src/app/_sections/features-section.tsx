'use client'

import dynamic from 'next/dynamic'
import { FeatureCard } from '@/components/feature-card'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { Ripple } from '@/components/magicui/ripple'
import { TrendingUp, TrendingDown, Zap, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence, useInView } from 'motion/react'
import { useState, useEffect, memo, useRef } from 'react'

const insights = [
  {
    icon: <TrendingUp className="w-4 h-4 text-white" />,
    bgColor: "bg-green-500",
    text: "Tech sector showing 23% YoY growth",
    time: "2 min ago"
  },
  {
    icon: <Zap className="w-4 h-4 text-white" />,
    bgColor: "bg-yellow-500",
    text: "AI investments up 150% this quarter",
    time: "5 min ago"
  },
  {
    icon: <AlertCircle className="w-4 h-4 text-white" />,
    bgColor: "bg-orange-500",
    text: "Market volatility creating opportunities",
    time: "12 min ago"
  },
  {
    icon: <TrendingDown className="w-4 h-4 text-white" />,
    bgColor: "bg-red-500",
    text: "Traditional retail facing headwinds",
    time: "18 min ago"
  },
  {
    icon: <TrendingUp className="w-4 h-4 text-white" />,
    bgColor: "bg-green-500",
    text: "ESG investments gaining momentum",
    time: "25 min ago"
  }
]

const Globe = dynamic(
  () => import('@/components/magicui/globe').then(mod => mod.Globe),
  {
    ssr: false,
    loading: () => <div className="w-[300px] h-[300px] rounded-full bg-muted/40" />,
  }
)

const InsightItem = ({ icon, bgColor, text, time }: { icon: React.ReactNode, bgColor: string, text: string, time: string }) => (
  <div className="flex items-start space-x-3 p-4 rounded-xl bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg">
    <div className={`${bgColor} p-2 rounded-lg flex items-center justify-center`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground font-medium">{text}</p>
      <p className="text-xs text-muted-foreground mt-1">{time}</p>
    </div>
  </div>
)

const StackedCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const stackRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(stackRef, { margin: '-20% 0px', amount: 0.3 })
  
  useEffect(() => {
    if (!isInView) return

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length)
    }, 3000)
    
    return () => window.clearInterval(interval)
  }, [isInView])
  
  const getCardStyle = (position: number) => {
    switch(position) {
      case 0: // Front card
        return {
          zIndex: 30,
          scale: 1,
          y: 0,
          opacity: 1,
          rotateX: 0
        }
      case 1: // Second card
        return {
          zIndex: 20,
          scale: 0.95,
          y: -10,
          opacity: 0.7,
          rotateX: -5
        }
      case 2: // Third card
        return {
          zIndex: 10,
          scale: 0.9,
          y: -20,
          opacity: 0.5,
          rotateX: -10
        }
      default: // Hidden cards
        return {
          zIndex: 0,
          scale: 0.85,
          y: -30,
          opacity: 0,
          rotateX: -15
        }
    }
  }
  
  const getVisibleInsights = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % insights.length
      visible.push({ ...insights[index], position: i })
    }
    return visible
  }
  
  return (
    <div
      ref={stackRef}
      className="relative h-[250px] w-full overflow-visible"
      style={{ perspective: '1000px' }}
    >
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] z-0 pointer-events-none">
        <Ripple 
          mainCircleSize={150}
          mainCircleOpacity={0.15}
          numCircles={5}
        />
      </div>
      <AnimatePresence mode="popLayout">
        {getVisibleInsights().map((insight, i) => {
          const style = getCardStyle(insight.position)
          return (
            <motion.div
              key={`${currentIndex}-${i}`}
              className="absolute inset-x-0 top-0"
              initial={{ 
                ...style,
                rotateX: -90,
                opacity: 0
              }}
              animate={style}
              exit={{ 
                scale: 1.1,
                y: 100,
                opacity: 0,
                rotateX: 90
              }}
              transition={{ 
                duration: 0.5,
                ease: [0.32, 0.72, 0, 1]
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <InsightItem
                icon={insight.icon}
                bgColor={insight.bgColor}
                text={insight.text}
                time={insight.time}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

const features = [
  {
    title: "Comprehensive 3-Year Stock Return Outlook",
    shapeValue: "strawberry-red-500",
    bottomContent: (
      <div className="flex flex-col justify-center h-[200px] w-full space-y-4 px-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Bear Case</div>
          <div className="text-3xl font-bold text-red-500">
            <NumberTicker className="text-red-500" value={1.8} decimalPlaces={1} delay={0} />x
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Base Case</div>
          <div className="text-4xl font-bold text-foreground">
            <NumberTicker value={2.5} decimalPlaces={1} delay={0.2} />x
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Bull Case</div>
          <div className="text-3xl font-bold text-emerald-500">
            <NumberTicker className="text-emerald-500" value={3.5} decimalPlaces={1} delay={0.4} />x
          </div>
        </div>
      </div>
    )
  },
  {
    title: "World-Class Equity Frameworks",
    shapeValue: "ultraviolet-burst-99",
    bottomContent: (
      <div className="absolute bottom-0 left-0 right-0 h-[400px] w-full flex items-end justify-center overflow-hidden">
        <div className="relative translate-y-[45%]">
          <Globe 
            className="w-[600px] h-[600px]" 
          />
        </div>
      </div>
    )
  },
  {
    title: "Actionable & Thought-Provoking Insights",
    shapeValue: "neon-green-matrix",
    bottomContent: <StackedCards />
  }
]

export const FeaturesSection = memo(function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-4 leading-none max-w-4xl">
          World Class Investment Intelligence, Optimized for
          <br />
          3-Year Hold Periods
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            bottomContent={feature.bottomContent}
            showShape={true}
            shapeValue={feature.shapeValue}
          />
        ))}
      </div>
      
    </section>
  )
})
