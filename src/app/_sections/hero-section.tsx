'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedNewsletterList } from '@/components/animated-newsletter-list'
import { useState } from 'react'


export function HeroSection() {
  const [videoError, setVideoError] = useState(false)
  
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Main Content */}
      <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-none">
            Expert-Grade 3Y MOIC
            <br />
            Projections In Your Inbox
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
                Get Started
              </Button>
            </Link>
          </div>
          
          <p className="text-base sm:text-lg font-semibold text-foreground max-w-full lg:max-w-md">
            Leveraging frameworks from Gurley,
            <br className="hidden sm:block" />
            Gerstner, Druckenmiller & more.
          </p>
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

      {/* Powered by OpenAI */}
      <div className="flex items-center justify-center gap-2 mt-8 text-muted-foreground">
        <span className="text-sm">Powered by</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          className="opacity-60"
        >
          <path 
            fill="currentColor" 
            d="M93.06 40.937c1.25-3.438 1.563-6.875 1.25-10.313-.312-3.437-1.562-6.875-3.125-10-2.812-4.687-6.875-8.437-11.562-10.625-5-2.187-10.313-2.812-15.625-1.562-2.5-2.5-5.313-4.688-8.438-6.25S48.685-.001 45.248-.001c-5.313 0-10.625 1.563-15 4.688a24.16 24.16 0 0 0-9.063 12.5c-3.75.937-6.875 2.5-10 4.374-2.812 2.188-5 5-6.875 7.813-2.812 4.688-3.75 10-3.125 15.313a27.2 27.2 0 0 0 6.25 14.375c-1.25 3.437-1.562 6.874-1.25 10.312s1.563 6.875 3.125 10c2.813 4.688 6.875 8.438 11.563 10.625 5 2.188 10.312 2.813 15.625 1.563 2.5 2.5 5.312 4.687 8.437 6.25s6.875 2.187 10.313 2.187c5.312 0 10.625-1.562 15-4.687s7.5-7.5 9.062-12.5c3.438-.626 6.875-2.188 9.688-4.376 2.812-2.187 5.312-4.687 6.875-7.812 2.812-4.687 3.75-10 3.125-15.312-.625-5.313-2.5-10.313-5.938-14.375m-37.5 52.5c-5 0-8.75-1.563-12.187-4.376 0 0 .312-.312.625-.312l20-11.562c.625-.313.937-.626 1.25-1.25.312-.626.312-.938.312-1.563V46.249l8.438 5v23.125c.312 10.938-8.438 19.063-18.438 19.063M15.248 76.249c-2.188-3.75-3.125-8.125-2.188-12.5 0 0 .313.312.625.312l20 11.563c.625.313.938.313 1.563.313s1.25 0 1.562-.313l24.375-14.062v9.687L40.873 83.124c-4.375 2.5-9.375 3.125-14.063 1.875-5-1.25-9.062-4.375-11.562-8.75M9.935 32.812c2.188-3.75 5.625-6.563 9.688-8.125v23.75c0 .625 0 1.25.312 1.562.313.625.625.938 1.25 1.25L45.56 65.311l-8.437 5-20-11.562c-4.375-2.5-7.5-6.562-8.75-11.25s-.938-10.312 1.562-14.687m69.063 15.937L54.623 34.687l8.437-5 20 11.562c3.125 1.875 5.625 4.375 7.188 7.5s2.5 6.563 2.187 10.313c-.312 3.437-1.562 6.874-3.75 9.687s-5 5-8.437 6.25v-23.75c0-.625 0-1.25-.313-1.562 0 0-.312-.625-.937-.938m8.437-12.5s-.312-.312-.625-.312l-20-11.563c-.625-.312-.937-.312-1.562-.312s-1.25 0-1.563.312L39.31 38.437v-9.688l20.313-11.875c3.125-1.875 6.562-2.5 10.312-2.5 3.438 0 6.875 1.25 10 3.437 2.813 2.188 5.313 5 6.563 8.125s1.562 6.876.937 10.313m-52.5 17.5-8.437-5V25.311c0-3.437.937-7.187 2.812-10 1.875-3.124 4.688-5.312 7.813-6.874 3.125-1.563 6.875-2.188 10.312-1.563 3.438.313 6.875 1.875 9.688 4.063 0 0-.313.312-.625.312l-20 11.562c-.625.313-.938.625-1.25 1.25s-.313.938-.313 1.563zm4.375-10 10.938-6.25 10.937 6.25v12.5l-10.937 6.25-10.938-6.25z"
          />
        </svg>
        <span className="text-sm font-semibold">OpenAI</span>
      </div>
    </section>
  )
}