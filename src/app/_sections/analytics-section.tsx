import { BarChart3, LineChart, PieChart } from 'lucide-react'

export function AnalyticsSection() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="bg-muted/30 backdrop-blur-sm border border-border rounded-2xl p-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 leading-none">
              Professional-Grade Analytics
            </h2>
            <p className="text-muted-foreground mb-6 leading-snug">
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
  )
}