import { ShieldCheck, Star, Users, MapPin, TrendingUp } from 'lucide-react'

const ITEMS = [
  { icon: Users, text: '12,000+ verified sellers' },
  { icon: TrendingUp, text: '45,000+ active listings' },
  { icon: MapPin, text: '15+ cities across Ethiopia' },
  { icon: Star, text: '4.8 avg seller rating' },
  { icon: ShieldCheck, text: 'Secure OTP verification' },
]

export default function SocialProofMarquee() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 py-3 border-y border-amber-400/30">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-amber-600 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-orange-500 to-transparent z-10 pointer-events-none" />

      <div className="marquee-track flex items-center gap-10 whitespace-nowrap">
        {doubled.map(({ icon: Icon, text }, i) => (
          <div
            key={`${text}-${i}`}
            className="inline-flex items-center gap-2.5 text-white/95 text-sm font-semibold shrink-0"
          >
            <Icon className="w-4 h-4 text-amber-100" />
            <span>{text}</span>
            <span className="text-amber-200/60 text-lg leading-none">·</span>
          </div>
        ))}
      </div>
    </div>
  )
}
