import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export function FooterSection() {
  return (
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
  )
}