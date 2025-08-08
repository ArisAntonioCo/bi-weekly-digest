import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export function FooterSection() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <TrendingUp className="size-5" />
            </div>
            <span className="text-lg sm:text-xl font-medium text-foreground">Weekly Digest</span>
          </div>
          <div className="flex gap-4 sm:gap-6 text-sm sm:text-base">
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
        <div className="mt-6 sm:mt-8 text-center text-muted-foreground text-xs sm:text-sm">
          © 2024 Weekly Digest. All rights reserved.
        </div>
      </div>
    </footer>
  )
}