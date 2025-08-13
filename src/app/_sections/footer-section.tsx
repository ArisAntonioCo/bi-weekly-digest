import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FooterSection() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center text-center mb-12">
          
          {/* Brand Column */}
          <div className="max-w-2xl">
            <div className="mb-4">
              <span className="text-2xl sm:text-3xl font-semibold text-foreground">3YMode</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Premium investment insights and market analysis for smarter portfolio decisions.
            </p>
            
            {/* CTA Button */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Ready to get started?</h4>
              <Link href="/signup">
                <Button variant="default" size="default" className="w-full sm:w-auto rounded-full text-sm sm:text-base">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>© 2025 3YMode. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}