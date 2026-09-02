import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import SocialProofMarquee from '../components/home/SocialProofMarquee'
import TrustFeatures from '../components/home/TrustFeatures'
import CategorySection from '../components/home/CategorySection'
import FeaturedListings from '../components/home/FeaturedListings'
import LocationSection from '../components/home/LocationSection'
import HowItWorks from '../components/home/HowItWorks'
import SellerCTA from '../components/home/SellerCTA'
import SafetySection from '../components/home/SafetySection'
import RecentListings from '../components/home/RecentListings'
import SectionReveal from '../components/home/SectionReveal'
import { RecommendedForYou } from '../components/recommendations/RecommendedForYou'
import { AdvertisementSlot } from '../components/advertisements/AdvertisementSlot'

export default function Home() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '')
      const element = document.getElementById(targetId)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 120)
      }
    }
  }, [location.hash])

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <SocialProofMarquee />

        <SectionReveal>
          <TrustFeatures />
        </SectionReveal>

        <SectionReveal delay={1}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <AdvertisementSlot placement="MARKETPLACE_BANNER" />
          </div>
        </SectionReveal>

        <SectionReveal delay={2}>
          <CategorySection />
        </SectionReveal>

        <SectionReveal>
          <FeaturedListings />
        </SectionReveal>

        {/* In-Feed Sponsored Placement (MARKETPLACE_FEATURED) */}
        <SectionReveal delay={1}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <AdvertisementSlot placement="MARKETPLACE_FEATURED" />
          </div>
        </SectionReveal>

        <SectionReveal delay={1}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <RecommendedForYou limit={12} maxItems={8} />
          </div>
        </SectionReveal>

        <SectionReveal delay={2}>
          <LocationSection />
        </SectionReveal>

        <HowItWorks />

        <SectionReveal>
          <SellerCTA />
        </SectionReveal>

        {/* Sponsored Showcase (MARKETPLACE_SIDEBAR) */}
        <SectionReveal delay={1}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <AdvertisementSlot placement="MARKETPLACE_SIDEBAR" />
          </div>
        </SectionReveal>

        <SectionReveal delay={1}>
          <SafetySection />
        </SectionReveal>

        <SectionReveal delay={2}>
          <RecentListings />
        </SectionReveal>
      </main>

      <Footer />
    </div>
  )
}
