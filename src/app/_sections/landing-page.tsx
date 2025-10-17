import { HomeSmoothScroll } from '../_components/home-smooth-scroll'
import { HeroSection } from './hero-section'
import { Why3YSection } from './why-3y-section'
import { AnalyticsSection } from './analytics-section'
import { BlogPreviewSection } from './blog-preview-section'
import { FooterSection } from './footer-section'
import { LazyLandingSections } from './lazy-sections'

export function LandingPage() {
  return (
    <div>
      <HomeSmoothScroll />
      {/* Hero section loads immediately - above the fold */}
      <HeroSection />
      {/* Why 3Y section directly after hero */}
      <Why3YSection />
      
      {/* Below-the-fold sections defer hydration for better responsiveness */}
      <LazyLandingSections />
      <AnalyticsSection />
      <BlogPreviewSection />
      <FooterSection />
    </div>
  )
}
