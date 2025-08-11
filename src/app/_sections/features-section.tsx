'use client'

import { FeatureCard } from '@/components/feature-card'
import { Globe } from '@/components/magicui/globe'

const features = [
  {
    title: "Comprehensive 3-Year Forward MOIC",
    subtitle: "Base, Bear & Bull Cases"
  },
  {
    title: "World-Class Equity Frameworks",
    bottomContent: (
      <div className="absolute bottom-0 left-0 right-0 h-[400px] w-full flex items-end justify-center overflow-hidden">
        <div className="relative translate-y-[45%]">
          <Globe 
            className="w-[600px] h-[600px]" 
            config={{
              width: 1200,
              height: 1200,
              devicePixelRatio: 2,
              phi: 0,
              theta: 0.3,
              markerColor: [255 / 255, 100 / 255, 0 / 255],
              markers: [
                { location: [37.7595, -122.4367], size: 0.03 },
                { location: [40.7128, -74.006], size: 0.04 },
                { location: [51.5074, -0.1278], size: 0.03 },
                { location: [35.6762, 139.6503], size: 0.04 },
                { location: [-33.8688, 151.2093], size: 0.03 },
                { location: [1.3521, 103.8198], size: 0.03 },
              ],
            }}
          />
        </div>
      </div>
    )
  },
  {
    title: "Current & Thoughtful Insights",
    subtitle: "Compounding & Risk Assessment"
  }
]

export function FeaturesSection() {
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
            subtitle={feature.subtitle}
            bottomContent={feature.bottomContent}
          />
        ))}
      </div>
    </section>
  )
}