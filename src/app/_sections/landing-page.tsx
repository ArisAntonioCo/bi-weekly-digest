'use client'

import dynamic from 'next/dynamic'
import { HomeSmoothScroll } from '../_components/home-smooth-scroll'
import { SectionSkeleton } from '@/components/ui/section-skeleton'
import { HeroSection } from './hero-section'
import { Why3YSection } from './why-3y-section'
import { AnalyticsSection } from './analytics-section'
import { BlogPreviewSection } from './blog-preview-section'
import { FooterSection } from './footer-section'
import { LazyLandingSections } from './lazy-sections'

const FeaturesSection = dynamic(
  () => import('./features-section').then(mod => ({ default: mod.FeaturesSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
)

export function LandingPage() {
  return (
    <div>
      <HomeSmoothScroll />
      {/* Above-the-fold sections */}
      <HeroSection />
      <FeaturesSection />
      <Why3YSection />
      
      {/* Below-the-fold sections defer hydration for better responsiveness */}
      <LazyLandingSections />
      <AnalyticsSection />
      <BlogPreviewSection />
      <FooterSection />
    </div>
  )
}
