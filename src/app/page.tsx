"use client"
import { useEffect } from 'react'
import Hero from '@/components/lp/Hero'
import TrustBar from '@/components/lp/TrustBar'
import FeatureGrid from '@/components/lp/FeatureGrid'
import PreviewShowcase from '@/components/lp/PreviewShowcase'
import TestimonialsCarousel from '@/components/lp/TestimonialsCarousel'
import HowItWorks from '@/components/lp/HowItWorks'
import ObjectionsBreaker from '@/components/lp/ObjectionsBreaker'
import PricingBanner from '@/components/lp/PricingBanner'
import FAQSection from '@/components/lp/FAQSection'
import CTASticky from '@/components/lp/CTASticky'

export default function HomePage() {
  useEffect(() => {
    try { (window as any).plausible?.('view_lp') } catch {}
  }, [])
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Hero />
      <TrustBar />
      <FeatureGrid />
      <PreviewShowcase />
      <TestimonialsCarousel />
      <HowItWorks />
      <ObjectionsBreaker />
      <PricingBanner />
      <FAQSection />
      <CTASticky />
    </main>
  )
}
