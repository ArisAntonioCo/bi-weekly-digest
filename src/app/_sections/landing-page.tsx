import { HeroSection } from './hero-section'
import { FrameworksSection } from './frameworks-section'
import { FeaturesSection } from './features-section'
import { AnalyticsSection } from './analytics-section'
import { BlogPreviewSection } from './blog-preview-section'
import { FAQSection } from './faq-section'
import { CTASection } from './cta-section'
import { FooterSection } from './footer-section'

export function LandingPage() {
  return (
    <div>
      <HeroSection />
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