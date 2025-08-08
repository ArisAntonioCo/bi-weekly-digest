import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { AnalyticsSection } from './analytics-section'
import { BlogPreviewSection } from './blog-preview-section'
import { CTASection } from './cta-section'
import { FooterSection } from './footer-section'

export function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <AnalyticsSection />
      <BlogPreviewSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}