'use client'

import { memo } from 'react'
import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/components/ui/section-skeleton'

// Defer hydration for client-only experiences
const FeaturesSection = dynamic(
  () => import('./features-section').then(mod => ({ default: mod.FeaturesSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
)

const FrameworksSection = dynamic(
  () => import('./frameworks-section').then(mod => ({ default: mod.FrameworksSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
)

const FAQSection = dynamic(
  () => import('./faq-section').then(mod => ({ default: mod.FAQSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
)

const CTASection = dynamic(
  () => import('./cta-section').then(mod => ({ default: mod.CTASection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
)

export const LazyLandingSections = memo(function LazyLandingSections() {
  return (
    <>
      <FeaturesSection />
      <FrameworksSection />
      <FAQSection />
      <CTASection />
    </>
  )
})
