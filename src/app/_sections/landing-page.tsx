'use client'

import dynamic from 'next/dynamic'
import { HeroSection } from './hero-section'
import { SectionSkeleton } from '@/components/ui/section-skeleton'

// Lazy load all below-the-fold sections for better performance
const Why3YSection = dynamic(
  () => import('./why-3y-section').then(mod => ({ default: mod.Why3YSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: true,
  }
)

const FeaturesSection = dynamic(
  () => import('./features-section').then(mod => ({ default: mod.FeaturesSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const FrameworksSection = dynamic(
  () => import('./frameworks-section').then(mod => ({ default: mod.FrameworksSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const AnalyticsSection = dynamic(
  () => import('./analytics-section').then(mod => ({ default: mod.AnalyticsSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const BlogPreviewSection = dynamic(
  () => import('./blog-preview-section').then(mod => ({ default: mod.BlogPreviewSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const FAQSection = dynamic(
  () => import('./faq-section').then(mod => ({ default: mod.FAQSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const CTASection = dynamic(
  () => import('./cta-section').then(mod => ({ default: mod.CTASection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const FooterSection = dynamic(
  () => import('./footer-section').then(mod => ({ default: mod.FooterSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

export function LandingPage() {
  return (
    <div>
      {/* Hero section loads immediately - above the fold */}
      <HeroSection />
      {/* Why 3Y section directly after hero */}
      <Why3YSection />
      
      {/* All other sections lazy load for optimal performance */}
      <FeaturesSection />
      <FrameworksSection />
      <AnalyticsSection />
      <BlogPreviewSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}
