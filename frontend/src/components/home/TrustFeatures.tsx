import { CheckCircle2, ShieldCheck, UserCheck, MessageSquare, MapPin, Zap, BadgeCheck } from 'lucide-react'

const TRUST_ITEMS = [
  {
    icon: UserCheck,
    title: 'Verified Users',
    subtitle: 'Email & phone authenticated',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200/80',
    glow: 'group-hover:shadow-sky-100',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Marketplace',
    subtitle: 'Safe meetup guidelines',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/80',
    glow: 'group-hover:shadow-emerald-100',
  },
  {
    icon: MapPin,
    title: 'Local Listings',
    subtitle: 'Find items in your sub-city',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200/80',
    glow: 'group-hover:shadow-violet-100',
  },
  {
    icon: MessageSquare,
    title: 'Direct Chat',
    subtitle: 'Connect with sellers instantly',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200/80',
    glow: 'group-hover:shadow-amber-100',
  },
  {
    icon: Zap,
    title: 'Fast Listings',
    subtitle: 'List your item in 2 minutes',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200/80',
    glow: 'group-hover:shadow-orange-100',
  },
  {
    icon: BadgeCheck,
    title: 'Fayda Verified',
    subtitle: 'National ID layer coming soon',
    color: 'text-stone-400',
    bg: 'bg-stone-50',
    border: 'border-stone-200/80',
    glow: '',
    upcoming: true,
  },
]

export default function TrustFeatures() {
  return (
    <section className="bg-white py-12 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
            Why thousands trust Vintage Marketplace
          </h2>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Built for Ethiopia's local second-hand economy
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, subtitle, color, bg, border, glow, upcoming }) => (
            <div
              key={title}
              className={`group relative flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border bg-white ${border} transition-all duration-300 ${
                upcoming ? 'opacity-60' : `hover:-translate-y-1 hover:shadow-lg ${glow}`
              }`}
            >
              {upcoming && (
                <span className="absolute -top-2 right-2 text-[9px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 rounded-full leading-none shadow-sm">
                  SOON
                </span>
              )}
              <div className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-extrabold text-stone-900 leading-tight">{title}</h4>
              <p className="text-[10px] text-stone-500 font-medium mt-1 leading-tight">{subtitle}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-stone-500 mr-1">Verification layers:</span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Email OTP
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Phone OTP
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Fayda / National ID (Upcoming)
          </span>
        </div>
      </div>
    </section>
  )
}
