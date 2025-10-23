import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DISCLAIMER_HEADING, DISCLAIMER_PARAGRAPHS } from '@/config/disclaimer'

export function FooterSection() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-12 mb-12">
          
          {/* Logo on left */}
          <div className="flex-shrink-0">
            <Image 
              src="/3YMode.svg" 
              alt="3YMode"
              width={120}
              height={65}
              className="w-auto h-16 sm:h-20 lg:h-24"
            />
          </div>
          
          {/* Content Column */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
            <p className="text-sm text-muted-foreground mb-6">
              Premium investment insights and market analysis for smarter portfolio decisions.
            </p>
            
            {/* CTA Button */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Ready to get started?</h4>
              <Button
                asChild
                variant="default"
                size="default"
                className="w-full sm:w-auto rounded-full text-sm sm:text-base"
              >
                <Link href="/signup">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center gap-4 text-center">
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
            <div className="max-w-3xl text-[11px] text-muted-foreground leading-relaxed">
              <p className="font-semibold uppercase tracking-wide text-foreground/80 mb-2">
                {DISCLAIMER_HEADING}
              </p>
              {DISCLAIMER_PARAGRAPHS.map(paragraph => (
                <p key={paragraph} className="mb-2 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
