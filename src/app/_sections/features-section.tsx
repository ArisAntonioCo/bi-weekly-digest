import { Shield, Zap, Brain } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-none">
          Intelligent Analytics Platform
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-snug px-4">
          Leverage cutting-edge AI to transform complex market data into actionable investment insights.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Feature 1 */}
        <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-6 sm:p-8 hover:bg-muted/70 transition-colors">
          <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-secondary-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 leading-none">
            AI-Driven Analysis
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-snug">
            Advanced machine learning algorithms analyze market patterns and identify high-potential investment opportunities.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-6 sm:p-8 hover:bg-muted/70 transition-colors">
          <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-secondary-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 leading-none">
            Risk Assessment
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-snug">
            Comprehensive risk analysis and portfolio optimization to protect and grow your investments.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-6 sm:p-8 hover:bg-muted/70 transition-colors sm:col-span-2 lg:col-span-1">
          <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-secondary-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 leading-none">
            Real-Time Updates
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-snug">
            Stay informed with weekly digests and real-time alerts on critical market movements.
          </p>
        </div>
      </div>
    </section>
  )
}