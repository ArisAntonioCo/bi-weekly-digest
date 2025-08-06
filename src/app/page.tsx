import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, LineChart, PieChart, ArrowRight, Shield, Zap, Brain } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Navigation */}
      <nav className="border-b border-zinc-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-zinc-100 text-zinc-900 flex size-8 items-center justify-center rounded-md">
                <TrendingUp className="size-5" />
              </div>
              <span className="text-xl font-semibold text-zinc-100">Weekly Digest</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-zinc-100 mb-6 bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            AI-Powered Investment Intelligence
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Get comprehensive weekly analysis of market trends, investment opportunities, and strategic insights delivered directly to your inbox.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
            Intelligent Analytics Platform
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Leverage cutting-edge AI to transform complex market data into actionable investment insights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-8 hover:bg-zinc-800/70 transition-colors">
            <div className="bg-zinc-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-zinc-100" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              AI-Driven Analysis
            </h3>
            <p className="text-zinc-400">
              Advanced machine learning algorithms analyze market patterns and identify high-potential investment opportunities.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-8 hover:bg-zinc-800/70 transition-colors">
            <div className="bg-zinc-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-zinc-100" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              Risk Assessment
            </h3>
            <p className="text-zinc-400">
              Comprehensive risk analysis and portfolio optimization to protect and grow your investments.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-8 hover:bg-zinc-800/70 transition-colors">
            <div className="bg-zinc-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-zinc-100" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              Real-Time Updates
            </h3>
            <p className="text-zinc-400">
              Stay informed with weekly digests and real-time alerts on critical market movements.
            </p>
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="container mx-auto px-6 py-24">
        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-800 rounded-2xl p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-6">
                Professional-Grade Analytics
              </h2>
              <p className="text-zinc-400 mb-6">
                Access the same analytical tools used by professional investors and hedge funds. Our platform provides deep insights into market dynamics, sector rotations, and emerging opportunities.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-zinc-300">
                  <BarChart3 className="h-5 w-5 mr-3 text-zinc-500" />
                  Technical Analysis & Chart Patterns
                </li>
                <li className="flex items-center text-zinc-300">
                  <LineChart className="h-5 w-5 mr-3 text-zinc-500" />
                  Performance Metrics & Backtesting
                </li>
                <li className="flex items-center text-zinc-300">
                  <PieChart className="h-5 w-5 mr-3 text-zinc-500" />
                  Portfolio Optimization & Allocation
                </li>
              </ul>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-8 border border-zinc-700">
              <div className="space-y-4">
                <div className="h-3 bg-zinc-700 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-700 rounded w-full"></div>
                <div className="h-3 bg-zinc-700 rounded w-5/6"></div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="h-20 bg-zinc-800 rounded"></div>
                  <div className="h-20 bg-zinc-800 rounded"></div>
                  <div className="h-20 bg-zinc-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
            Start Your Investment Journey Today
          </h2>
          <p className="text-zinc-300 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust our AI-powered platform for market insights and investment strategies.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-zinc-100 text-zinc-900 flex size-8 items-center justify-center rounded-md">
                <TrendingUp className="size-5" />
              </div>
              <span className="text-xl font-semibold text-zinc-100">Weekly Digest</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-zinc-500 text-sm">
            © 2024 Weekly Digest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
