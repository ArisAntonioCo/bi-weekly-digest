import { Shield, Zap, Brain } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-none">
          Intelligent Analytics Platform
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-snug">
          Leverage cutting-edge AI to transform complex market data into actionable investment insights.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-8 hover:bg-muted/70 transition-colors">
          <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-secondary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2 leading-none">
            AI-Driven Analysis
          </h3>
          <p className="text-muted-foreground leading-snug">
            Advanced machine learning algorithms analyze market patterns and identify high-potential investment opportunities.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-8 hover:bg-muted/70 transition-colors">
          <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-secondary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2 leading-none">
            Risk Assessment
          </h3>
          <p className="text-muted-foreground leading-snug">
            Comprehensive risk analysis and portfolio optimization to protect and grow your investments.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-8 hover:bg-muted/70 transition-colors">
          <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-secondary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2 leading-none">
            Real-Time Updates
          </h3>
          <p className="text-muted-foreground leading-snug">
            Stay informed with weekly digests and real-time alerts on critical market movements.
          </p>
        </div>
      </div>
    </section>
  )
}