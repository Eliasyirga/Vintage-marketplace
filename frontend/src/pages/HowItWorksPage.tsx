import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MessageSquare,
  Handshake,
  ShieldCheck,
  Camera,
  DollarSign,
  MapPin,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const BUYER_STEPS = [
  {
    num: '01',
    title: 'Discover Authentic Items',
    description:
      'Search thousands of pre-loved items, vintage collectables, phones, electronics, and fashion across Addis Ababa and Ethiopian cities.',
    icon: Search,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    num: '02',
    title: 'Chat with Verified Sellers',
    description:
      'Message the seller directly through our encrypted in-app messaging. Ask about item condition, request more photos, and negotiate terms.',
    icon: MessageSquare,
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    num: '03',
    title: 'Inspect & Pay Safely',
    description:
      'Choose doorstep delivery with escrow protection or meet in a safe public place. Thoroughly test the item before completing payment.',
    icon: Handshake,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
]

const SELLER_STEPS = [
  {
    num: '01',
    title: 'Snap & List in 2 Minutes',
    description:
      'Take clean photos of your pre-loved product, select category and condition, and set a competitive price.',
    icon: Camera,
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    num: '02',
    title: 'Build Instant Trust with Badges',
    description:
      'Verify your email and Ethiopian Fayda National ID to earn trusted seller badges that increase buyer inquiries by up to 300%.',
    icon: ShieldCheck,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    num: '03',
    title: 'Sell & Get Paid',
    description:
      'Receive instant buyer messages, agree on safe delivery or pickup, and receive payments directly via Telebirr, Chapa, or cash upon meetup.',
    icon: DollarSign,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
]

const SAFETY_TIPS = [
  {
    title: 'Meet in Public Locations',
    description:
      'Always meet during daylight hours in well-lit public spots like malls (e.g. Bole Medhanialem, Edna Mall), cafes, or designated banks.',
    icon: MapPin,
  },
  {
    title: 'Look for Verified Badges',
    description:
      'Prioritize sellers and buyers who have verified badges (Email Verified, Fayda National ID Verified) for authentic transactions.',
    icon: ShieldCheck,
  },
  {
    title: 'Inspect Before Final Payment',
    description:
      'Check electronics serial numbers, power on gadgets, inspect condition thoroughly before handing over money or releasing escrow.',
    icon: CheckCircle2,
  },
  {
    title: 'Keep Chats on Platform',
    description:
      'Use the in-app chat for all negotiations and order agreements so our support team can assist in the event of any dispute.',
    icon: Lock,
  },
]

const FAQS = [
  {
    q: 'Is it free to list and sell items on Vintage Marketplace?',
    a: 'Yes! Basic listings are completely free for all individual sellers in Ethiopia. You can post up to 10 active listings at zero cost.',
  },
  {
    q: 'What is Fayda ID verification and why is it important?',
    a: 'Fayda is the official Ethiopian National Digital ID system. Verifying your identity with Fayda proves you are a verified individual, granting you a gold trust badge that protects both buyers and sellers from fraud.',
  },
  {
    q: 'How does payment work?',
    a: 'We support in-person cash on meetup, instant mobile payments (Telebirr, CBE Birr), and secure platform payments powered by Chapa with escrow protection.',
  },
  {
    q: 'Can I arrange home delivery instead of meeting in person?',
    a: 'Yes, sellers can offer localized delivery within Addis Ababa and regional cities with calculated delivery fees based on sub-city distance.',
  },
]

export default function HowItWorksPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            Simple & Trusted
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
            How <span className="text-amber-600">Vintage Marketplace</span> Works
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Bringing Ethiopia’s traditional Bonda & pre-loved item market online — making buying and
            selling quality goods safe, transparent, and accessible across the country.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <a
              href="#buying"
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-amber-500 text-xs font-bold shadow-2xs transition-colors"
            >
              For Buyers ↓
            </a>
            <a
              href="#selling"
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-amber-500 text-xs font-bold shadow-2xs transition-colors"
            >
              For Sellers ↓
            </a>
            <a
              href="#safety"
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-amber-500 text-xs font-bold shadow-2xs transition-colors"
            >
              Safety & Trust ↓
            </a>
          </div>
        </div>

        {/* ── Section 1: For Buyers ─────────────────────────────────────────── */}
        <section id="buying" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
                Buyer Guide
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Buying on Vintage in 3 Easy Steps
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {BUYER_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.num}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${step.color} shadow-xs`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-stone-300 font-mono">
                        {step.num}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Section 2: For Sellers ─────────────────────────────────────────── */}
        <section id="selling" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
                Seller Guide
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Turn Unused Items into Cash
              </h2>
            </div>
            <Link
              to="/sell"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800"
            >
              <span>Create a Listing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {SELLER_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.num}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${step.color} shadow-xs`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-stone-300 font-mono">
                        {step.num}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Section 3: Safety & Trust ─────────────────────────────────────── */}
        <section id="safety" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
              Safe & Secure Commerce
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Our Safety & Trust Commitments
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              We design every feature with security first so you can trade locally with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAFETY_TIPS.map((tip, idx) => {
              const Icon = tip.icon
              return (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900">{tip.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    {tip.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Section 4: FAQ Accordion ──────────────────────────────────────── */}
        <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Frequently Asked Questions</h2>
              <p className="text-xs text-stone-500 font-medium">
                Everything you need to know about using Vintage Marketplace.
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-stone-900 hover:text-amber-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-amber-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Section 5: Bottom CTA ─────────────────────────────────────────── */}
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-amber-500/20">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg leading-relaxed font-medium">
              Create your free account today and start discovering great local deals or making money from your pre-loved goods.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/marketplace"
              className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs sm:text-sm transition-colors"
            >
              Browse Products
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              Join Vintage Free
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
