import { Search, MessageSquare, Handshake, ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  {
    num: '01',
    title: 'Discover',
    description: 'Search and browse thousands of quality pre-loved items near your location across Ethiopia.',
    icon: Search,
    color: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    num: '02',
    title: 'Connect',
    description: 'Message verified sellers directly, ask questions, negotiate price, and arrange a safe meetup.',
    icon: MessageSquare,
    color: 'from-amber-500 to-amber-600',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    num: '03',
    title: 'Deal Done',
    description: 'Meet in a safe public place, inspect the item, pay in person, and leave a seller review.',
    icon: Handshake,
    color: 'from-emerald-500 to-emerald-600',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
]

const sellerSteps = [
  { label: 'Create free account', done: true },
  { label: 'List item in 2 minutes', done: true },
  { label: 'Get contacted by buyers', done: true },
  { label: 'Sell & get paid in cash', done: true },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-stone-900 border-b border-stone-800 relative overflow-hidden">
      {/* Decorative */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4">
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Vintage Works
          </h2>
          <p className="text-stone-400 mt-3 text-base font-medium leading-relaxed">
            Bringing the traditional Ethiopian Bonda market experience online — simple, transparent, and local.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.num} className="relative">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-6 z-10 -translate-x-3">
                    <ArrowRight className="w-6 h-6 text-stone-600" />
                  </div>
                )}
                <div className="h-full flex flex-col p-7 bg-stone-800/60 border border-stone-700/60 hover:border-stone-600 rounded-3xl transition-all duration-300 hover:bg-stone-800 group">
                  {/* Step number + icon row */}
                  <div className="flex items-start justify-between mb-6">
                    <span className={`text-5xl font-black font-mono ${step.textColor} opacity-30 leading-none`}>
                      {step.num}
                    </span>
                    <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg flex-shrink-0`} style={{ width: '52px', height: '52px' }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2">{step.title}</h3>
                  <p className="text-stone-400 text-sm font-medium leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Seller flow callout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seller steps card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-7 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative">
              <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mb-4">Start Selling in Minutes</p>
              <h3 className="text-2xl font-extrabold text-white mb-6 leading-tight">
                List your item<br />earn real cash
              </h3>
              <div className="space-y-2.5 mb-6">
                {sellerSteps.map(({ label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white/90 text-sm font-semibold">{label}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-700 font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-lg text-sm"
              >
                Start Selling Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* FAQ-style quick facts */}
          <div className="bg-stone-800/60 border border-stone-700/60 rounded-3xl p-7 space-y-4">
            <p className="text-stone-300 text-xs font-bold uppercase tracking-widest mb-4">Quick Facts</p>
            {[
              { q: 'Is it free to list?', a: 'Yes — listing is completely free. No commission fees.' },
              { q: 'Who can use it?', a: 'Anyone with a verified email or Ethiopian phone number.' },
              { q: 'How do I pay?', a: 'Cash in person at a safe public location you agree on.' },
              { q: 'Is my contact private?', a: 'Yes — messaging stays in-app until you choose to share.' },
            ].map(({ q, a }) => (
              <div key={q} className="flex gap-3 py-3 border-b border-stone-700/50 last:border-0">
                <span className="text-amber-400 font-black text-xs mt-0.5 flex-shrink-0">Q</span>
                <div>
                  <p className="text-white text-xs font-bold">{q}</p>
                  <p className="text-stone-400 text-xs font-medium mt-0.5">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
