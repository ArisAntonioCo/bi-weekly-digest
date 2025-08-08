import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, LineChart, PieChart, ArrowRight, Shield, Zap, Brain } from 'lucide-react'

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-2 w-2 bg-foreground rounded-full"></div>
            <span className="text-sm text-muted-foreground uppercase tracking-wider">Top Investment Newsletter</span>
          </div>
          
          {/* Main Headline - Two Lines */}
          <h1 className="text-6xl md:text-8xl font-medium text-foreground mb-6 leading-none">
            Predictive Finance
            <br />
            In Your Inbox
          </h1>
          
          {/* Subtext */}
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            AI-powered MOIC projections and market insights in your inbox.
          </p>
          
          {/* CTA Button */}
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-card text-card-foreground hover:bg-muted border border-border px-8 py-6 text-lg rounded-full shadow-2xl shadow-card/50 transition-all hover:shadow-card/70 hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
            Intelligent Analytics Platform
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leverage cutting-edge AI to transform complex market data into actionable investment insights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-8 hover:bg-muted/70 transition-colors">
            <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              AI-Driven Analysis
            </h3>
            <p className="text-muted-foreground">
              Advanced machine learning algorithms analyze market patterns and identify high-potential investment opportunities.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-8 hover:bg-muted/70 transition-colors">
            <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              Risk Assessment
            </h3>
            <p className="text-muted-foreground">
              Comprehensive risk analysis and portfolio optimization to protect and grow your investments.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-8 hover:bg-muted/70 transition-colors">
            <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              Real-Time Updates
            </h3>
            <p className="text-muted-foreground">
              Stay informed with weekly digests and real-time alerts on critical market movements.
            </p>
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="container mx-auto px-6 py-24">
        <div className="bg-muted/30 backdrop-blur-sm border border-border rounded-2xl p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-6">
                Professional-Grade Analytics
              </h2>
              <p className="text-muted-foreground mb-6">
                Access the same analytical tools used by professional investors and hedge funds. Our platform provides deep insights into market dynamics, sector rotations, and emerging opportunities.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-foreground">
                  <BarChart3 className="h-5 w-5 mr-3 text-muted-foreground" />
                  Technical Analysis & Chart Patterns
                </li>
                <li className="flex items-center text-foreground">
                  <LineChart className="h-5 w-5 mr-3 text-muted-foreground" />
                  Performance Metrics & Backtesting
                </li>
                <li className="flex items-center text-foreground">
                  <PieChart className="h-5 w-5 mr-3 text-muted-foreground" />
                  Portfolio Optimization & Allocation
                </li>
              </ul>
            </div>
            <div className="bg-card/50 rounded-lg p-8 border border-border">
              <div className="space-y-4">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="h-20 bg-secondary rounded"></div>
                  <div className="h-20 bg-secondary rounded"></div>
                  <div className="h-20 bg-secondary rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
            Latest Investment Insights
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore our AI-powered analysis and stay ahead of market trends with comprehensive investment research.
          </p>
          <Link href="/blogs">
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
              View All Insights
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="bg-gradient-to-r from-muted to-secondary rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
            Start Your Investment Journey Today
          </h2>
          <p className="text-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust our AI-powered platform for market insights and investment strategies.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                <TrendingUp className="size-5" />
              </div>
              <span className="text-xl font-medium text-foreground">Weekly Digest</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground text-sm">
            © 2024 Weekly Digest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
