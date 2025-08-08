import { FeatureCard } from '@/components/feature-card'
import { TrendingUp, Brain, Shield } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-none max-w-4xl">
          World Class Investment Intelligence, Optimized for
          <br />
          3-Year Hold Periods
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
        {/* Feature 1 - Comprehensive MOIC Analysis */}
        <FeatureCard
          title="Comprehensive 3-Year Forward MOIC"
          subtitle="Base, Bear & Bull Cases"
          bottomContent={
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-brand" />
              </div>
              <div className="text-sm text-background/70">
                Multiple scenario analysis with probability weightings
              </div>
            </div>
          }
        />

        {/* Feature 2 - Expert-Level Analysis */}
        <FeatureCard
          title="World-Class Equity Frameworks"
          subtitle="Analysis from Industry Experts"
          bottomContent={
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-brand" />
              </div>
              <div className="text-sm text-background/70">
                Institutional-grade methods and actionable insights
              </div>
            </div>
          }
        />

        {/* Feature 3 - Risk & Opportunity Insights */}
        <FeatureCard
          title="Current & Thoughtful Insights"
          subtitle="Compounding & Risk Assessment"
          bottomContent={
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-brand" />
              </div>
              <div className="text-sm text-background/70">
                Weekly updates on opportunities and risk factors
              </div>
            </div>
          }
        />
      </div>
    </section>
  )
}