import { HeroSection } from './sections/HeroSection'
import { TrustedBySection } from './sections/TrustedBySection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { AIHighlightSection } from './sections/AIHighlightSection'
import { TestimonialsSection } from './sections/TestimonialsSection'
import { PricingSection } from './sections/PricingSection'
import { FAQSection } from './sections/FAQSection'
import { CTASection } from './sections/CTASection'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <HowItWorksSection />
      <FeaturesSection />
      <AIHighlightSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  )
}
