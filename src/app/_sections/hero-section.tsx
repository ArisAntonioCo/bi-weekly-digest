'use client'

import Link from 'next/link'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DISCLAIMER_SHORT } from '@/config/disclaimer'

export function HeroSection() {
  return (
    <section id="hero" className="relative w-full p-3">
      <div className="relative isolate flex w-full overflow-hidden rounded-2xl bg-black min-h-[min(calc(100svh-72px),880px)] lg:min-h-[min(calc(100svh-88px),1024px)]">
        <div className="pointer-events-none absolute inset-y-0 right-[-60%] sm:right-[-40%] lg:right-[-28%] w-[180%] sm:w-[130%] lg:w-[110%]">
          <video
            className="absolute inset-0 z-0 h-full w-full object-cover object-right"
            src="/videos/herovideo1.mp4"
            preload="metadata"
            loop
            autoPlay
            muted
            playsInline
            aria-hidden="true"
          />
        </div>

        <div className="relative z-20 flex w-full max-w-none flex-col gap-8 pl-10 sm:pl-16 md:pl-24 pr-6 sm:pr-10 md:pr-14 py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="max-w-4xl">
            <h1 className="font-sans text-[2.5rem] font-medium leading-tight tracking-tight text-white sm:text-[3rem] lg:text-[4rem] xl:text-[4.25rem]">
              <span className="block">Expert Medium-Term</span>
              <span className="block whitespace-nowrap">Stock Analysis Projections</span>
            </h1>
          </div>

          <Button
            asChild
            variant="promo"
            className="w-fit"
          >
            <Link href="/signup">Subscribe Now</Link>
          </Button>

          <div className="flex items-center gap-2 text-sm text-white/70">
            <Info className="h-4 w-4" aria-hidden="true" />
            <span>We&apos;ll never ask for your credit card.</span>
          </div>
          <p className="text-xs text-white/50 max-w-xl">
            {DISCLAIMER_SHORT}
          </p>

          <p className="max-w-2xl text-base sm:text-lg text-white/80">
            Forecast frameworks from Gurley, Gerstner, Druckenmiller, Meeker & Kindig—delivered weekly so you can move with conviction and cut through the noise.
          </p>
        </div>
      </div>
    </section>
  )
}
