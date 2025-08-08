import { FeatureCard } from '@/components/feature-card'

const features = [
  {
    title: "Comprehensive 3-Year Forward MOIC",
    subtitle: "Base, Bear & Bull Cases"
  },
  {
    title: "World-Class Equity Frameworks",
    subtitle: "Analysis from Industry Experts"
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
          />
        ))}
      </div>
    </section>
  )
}