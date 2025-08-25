'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedNewsletterList } from '@/components/animated-newsletter-list'
import { useState } from 'react'
import Avvvatars from 'avvvatars-react'


export function HeroSection() {
  const [videoError, setVideoError] = useState(false)
  
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Main Content */}
      <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-none">
            See the Market the Way
            <br />
            Billion-Dollar Investors Do
          </h1>
        </div>

        {/* CTA Section with Subheading */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Get Expert Analysis</h3>
              <p className="text-sm text-foreground">In Your Inbox</p>
            </div>
            <Link href="/signup">
              <Button variant="brand-cta" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                Subscribe Now
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div 
              className="inline-block [&_div]:!bg-transparent [&_svg]:!bg-transparent [&_svg_rect]:!fill-transparent [&_svg_path]:!fill-black"
              style={{ 
                animation: 'spin 8s linear infinite' 
              }}
            >
              <Avvvatars 
                value="sparkle"
                style="shape"
                size={32}
              />
            </div>
            <p className="text-base sm:text-lg font-semibold text-foreground max-w-full lg:max-w-md">
              Leveraging frameworks from Gurley,
              <br className="hidden sm:block" />
              Gerstner, Druckenmiller & more.
            </p>
          </div>
        </div>

        {/* Hero Images Container */}
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
          {/* Main Hero Video */}
          <div className="rounded-3xl h-[300px] sm:h-[400px] lg:h-[500px] flex-1 overflow-hidden relative">
            <video 
              src="/videos/HeroVideo.mp4"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl"
              autoPlay
              loop
              muted
              playsInline
              onError={(e) => {
                console.error('Video error:', e);
                setVideoError(true);
              }}
              onLoadedData={() => console.log('Video loaded successfully')}
            />
            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-3xl">
                <p className="text-muted-foreground text-center px-4">Unable to load video</p>
              </div>
            )}
          </div>
          
          {/* Square Newsletter Updates Card */}
          <div className="bg-foreground rounded-3xl w-full lg:w-[500px] h-[400px] sm:h-[450px] lg:h-[500px] flex flex-col overflow-hidden">
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-background leading-tight">Weekly 3Y MOIC<br />Predictions Delivered</h3>
            </div>
            
            <div className="flex-1 relative px-6 sm:px-8 pb-6 sm:pb-8">
              <AnimatedNewsletterList />
            </div>
          </div>
      </div>

    </section>
  )
}